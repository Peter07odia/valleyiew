import { beforeEach, describe, expect, it, vi } from "vitest";
import { chatSchema } from "./chat-schema";
import { clinicSystemPrompt } from "./system-prompt";
const {rpc, stream}=vi.hoisted(()=>({rpc:vi.fn(),stream:vi.fn()}));
vi.mock("@/lib/registration/server",()=>({getRegistrationClient:()=>({rpc})}));
vi.mock("ai",()=>({convertToModelMessages:vi.fn(async x=>x),streamText:stream}));
import {POST} from "@/app/api/chat/route";
const payload={clinic:"whitby",messages:[{id:"message-1",role:"user",parts:[{type:"text",text:"What are your hours?"}]}]};
const request=(body:unknown=payload,origin="http://localhost:3200")=>new Request("http://localhost:3200/api/chat",{method:"POST",headers:{origin,"content-type":"application/json"},body:JSON.stringify(body)});
beforeEach(()=>{vi.stubEnv("NODE_ENV","test");vi.stubEnv("GEMINI_API_KEY","synthetic-key");vi.stubEnv("VVM_CHAT_RATE_LIMIT_SECRET","synthetic-secret");rpc.mockReset();stream.mockReset();});
describe("public clinic assistant",()=>{
 it("rejects system/tool messages, attachments and excessive text",()=>{
  for(const role of ["system","tool"]){expect(chatSchema.safeParse({...payload,messages:[{...payload.messages[0],role}]}).success).toBe(false)}
  expect(chatSchema.safeParse({...payload,messages:[{id:"1",role:"user",parts:[{type:"file",url:"https://example.com"}]}]}).success).toBe(false);
  expect(chatSchema.safeParse({...payload,messages:[{id:"1",role:"user",parts:[{type:"text",text:"a".repeat(1501)}]}]}).success).toBe(false);
 });
 it("accepts AI SDK step markers while retaining only text",()=>{ const result=chatSchema.parse({...payload,messages:[{id:"prior",role:"assistant",parts:[{type:"step-start"},{type:"text",text:"Hello"}]},...payload.messages]});expect(result.messages[0].parts).toEqual([{type:"text",text:"Hello"}]); });
 it("grounds doctors and hours in the shared registry",()=>{
  const prompt=clinicSystemPrompt("peterborough-lansdowne-mall");expect(prompt).toContain("Dr. Henry Oghotuoma");expect(prompt).toContain("Dr. Eseigbe Uwadia");expect(prompt).toContain("Saturday: 10:00–15:00");expect(prompt).toContain("no patient database access");
 });
 it("rejects other origins before database or model access",async()=>{expect((await POST(request(payload,"https://evil.example"))).status).toBe(403);expect(rpc).not.toHaveBeenCalled();expect(stream).not.toHaveBeenCalled()});
 it("fails closed when rate limiting is unavailable",async()=>{rpc.mockResolvedValue({error:{message:"private"}});const res=await POST(request());expect(res.status).toBe(503);expect(await res.text()).not.toContain("private");expect(stream).not.toHaveBeenCalled()});
 it("enforces persistent limits before calling model",async()=>{rpc.mockResolvedValue({data:false});expect((await POST(request())).status).toBe(429);expect(stream).not.toHaveBeenCalled()});
 it("returns a safe fallback on provider failure",async()=>{rpc.mockResolvedValue({data:true});stream.mockImplementation(()=>{throw Error("secret provider detail")});const res=await POST(request());expect(res.status).toBe(503);expect(await res.text()).not.toContain("secret provider detail")});
 it("passes the chosen clinic and bounded output to the model",async()=>{rpc.mockResolvedValue({data:true});stream.mockReturnValue({toUIMessageStreamResponse:()=>new Response("ok")});expect((await POST(request())).status).toBe(200);expect(stream).toHaveBeenCalledWith(expect.objectContaining({maxOutputTokens:500,system:expect.stringContaining("Selected clinic: Valleyview Medical Centre - Whitby")}));});
});
