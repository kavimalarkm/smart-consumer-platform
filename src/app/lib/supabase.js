import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mjmkzhyqphbfjhxncumd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qbWt6aHlxcGhiZmpoeG5jdW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNTc2MjksImV4cCI6MjA4OTczMzYyOX0.NEV3-Nnv6NtCYWBQOr19hKq9dEYJyuFhQwen3NXxmzg";

export const supabase = createClient(supabaseUrl, supabaseKey);