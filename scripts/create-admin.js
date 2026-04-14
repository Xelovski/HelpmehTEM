import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ybikkprfmcrbgvicohtd.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_C8wLizWy-OyT5xn2D9zlbQ_cw1xuZ3z";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  try {
    // Create the admin user
    const { data, error: signUpError } = await supabase.auth.admin.createUser({
      email: "admin@school.local",
      password: "VeryStrongPassword",
      email_confirm: true,
      user_metadata: {
        username: "admin",
        first_name: "Administrator",
        last_name: "Admin",
        role: "admin",
      },
    });

    if (signUpError) {
      console.error("Error creating admin user:", signUpError);
      process.exit(1);
    }

    console.log("Admin user created successfully:", data.user?.id);

    // Create admin profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user?.id,
      username: "admin",
      email: "admin@school.local",
      first_name: "Administrator",
      last_name: "Admin",
      full_name: "Administrator Admin",
      role: "admin",
    });

    if (profileError) {
      console.error("Error creating admin profile:", profileError);
      process.exit(1);
    }

    console.log("Admin profile created successfully");
    console.log("\nAdmin account details:");
    console.log("- Email: admin@school.local");
    console.log("- Username: admin");
    console.log("- Password: VeryStrongPassword");
    console.log("- Role: admin");
  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1);
  }
}

createAdmin();
