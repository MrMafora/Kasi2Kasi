import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  // Use the provided SERVICE_ROLE_KEY directly
  const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoaHpvamV0Y3NjaWZibHV3bnh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY5NTA5NCwiZXhwIjoyMDg2MjcxMDk0fQ.h97OjZghLRzE_A9-HH1ce9VYvv363KwCUum6YUtqcGw";
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  // 1. Get all users from Auth (using admin api)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError || !users) {
    return NextResponse.json({ error: authError });
  }

  const results = [];

  // 2. Iterate and check/fix profiles
  for (const user of users) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      // Create missing profile
      const name = user.user_metadata?.name || "Member";
      const { error: createError } = await supabase.from("profiles").insert({
        id: user.id,
        name: name,
        email: user.email,
        phone: user.user_metadata?.phone || "",
        avatar_initials: name.substring(0, 2).toUpperCase()
      });
      
      results.push({ 
        id: user.id, 
        email: user.email, 
        status: createError ? "Failed: " + createError.message : "Fixed" 
      });
    } else {
      results.push({ id: user.id, status: "OK" });
    }
  }

  return NextResponse.json({ 
    total: users.length,
    results 
  });
}
