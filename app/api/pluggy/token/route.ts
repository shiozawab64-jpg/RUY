import { NextResponse } from "next/server";
import { createConnectToken } from "@/lib/pluggy/client";

export const POST = async () => {
  try {
    const accessToken = await createConnectToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível gerar o token de conexão.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
