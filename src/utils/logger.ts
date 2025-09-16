import { supabase } from "@/lib/supabaseClient";
import { UserRole } from "@/context/AuthContext"; // Import UserRole type

/**
 * Logs an activity to the Supabase 'logs' table.
 * @param message The log message.
 * @param logLevel The severity level of the log (e.g., 'info', 'warning', 'error').
 * @param userId Optional ID of the user performing the action.
 */
export const logActivity = async (
  message: string,
  logLevel: "info" | "warning" | "error" | "debug" = "info",
  userId: string | null = null
) => {
  try {
    const { error } = await supabase.from("logs").insert({
      message,
      log_level: logLevel,
      user_id: userId,
    });

    if (error) {
      console.error("Error logging activity to Supabase:", error.message);
    }
  } catch (e) {
    console.error("Unexpected error in logActivity:", e);
  }
};