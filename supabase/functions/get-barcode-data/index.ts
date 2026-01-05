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

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get("Authorization");

    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Authorization header is required" }),
        { status: 401 }
      );
    }

    const { barcode } = await req.json();

    if (
      !barcode ||
      typeof barcode !== "string" ||
      barcode.trim().length === 0
    ) {
      return new Response(JSON.stringify({ error: "Barcode is required" }), {
        status: 400,
      });
    }

    const EAN13 = /^\d{13}$/;
    const UPCA = /^\d{12}$/;
    const EAN8 = /^\d{8}$/;

    if (!(EAN13.test(barcode) || UPCA.test(barcode) || EAN8.test(barcode))) {
      return new Response(JSON.stringify({ error: "Invalid barcode format" }), {
        status: 400,
      });
    }

    // const token = auth.replace("Bearer ", "");
    // const { data: user, error: userError } = await supabaseClient.auth.getUser(
    //   token
    // );

    // if (userError || !user) {
    //   return new Response(
    //     JSON.stringify({ error: userError?.message || "Unauthorized" }),
    //     { status: 401 }
    //   );
    // }

    const { data: groceryItem, error: groceryItemError } = await supabaseClient
      .from("grocery_items")
      .select("*")
      .eq("barcode", barcode)
      .maybeSingle();

    if (groceryItemError) {
      return new Response(JSON.stringify({ error: groceryItemError.message }), {
        status: 500,
      });
    }

    if (groceryItem) {
      return new Response(JSON.stringify(groceryItem), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          "User-Agent": "Pantry/1.0.0 (simanzler@gmail.com)",
        },
      }
    );

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch product" }),
        { status: 500 }
      );
    }

    const data = await res.json();

    if (data.status !== 1) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
      });
    }

    const product = {
      barcode,
      is_global: true,
      name: data.product.product_name,
      brand: data.product.brands,
      image_url: data.product.image_url,
      quantity: Math.round(Number(data.product.product_quantity)),
      quantity_unit: data.product.product_quantity_unit,
    };

    const { data: insertedGroceryItem, error: insertError } =
      await supabaseClient
        .from("grocery_items")
        .insert(product)
        .select()
        .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify(insertedGroceryItem), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-barcode-data' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"barcode":"1234567890123"}'

*/
