// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const model = new Supabase.ai.Session("gte-small");

// TODO: implement create grocery item function
Deno.serve(async (req) => {
  // auth
  try {
    const auth = req.headers.get("Authorization");

    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401 }
      );
    }

    const token = auth.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: "Could not find user" }), {
        status: 401,
      });
    }

    const { name, householdId } = await req.json();

    console.log(householdId);
    console.log(user.id);
    const { data: isHouseholdUser, error: authError } = await supabaseClient
      .from("household_users")
      .select("*")
      .eq("user_id", user.id)
      .eq("household_id", householdId)
      .maybeSingle();

    console.log(isHouseholdUser);

    if (!isHouseholdUser || authError) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length < 3) {
      return new Response(
        JSON.stringify({ error: "Name must be more than 3 characters" }),
        { status: 400 }
      );
    }

    console.log("got here");

    const embedding = await model.run(name, {
      mean_pool: true,
      normalize: true,
    });

    console.log("function call");

    const { data: iconId, error: iconError } = await supabaseClient.rpc(
      "query_closest_icon_embedding",
      {
        p_embedding: embedding,
      }
    );

    console.log(iconId);
    console.log(iconError);

    if (!iconId || iconError) {
      return new Response(
        JSON.stringify({ error: "Error occured finding icon" }),
        { status: 500 }
      );
    }

    const { data: row, error: insertError } = await supabaseClient
      .from("grocery_items")
      .insert({ name, icon_id: iconId, household_id: householdId })
      .select()
      .single();

    if (!row || insertError) {
      return new Response(
        JSON.stringify({ error: "Error occured inserting grocery item" }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ name }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-grocery-item' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
