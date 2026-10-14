export async function POST() {
  return Response.json({ error: "The test form has been retired. Use /new-patient-form for patient registration." }, { status: 410 });
}
