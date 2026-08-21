/**
 * Manual harness for the occasion agent. Publishing is opt-in and never the default.
 *
 *   npx tsx scripts/test-occasion-agent.ts plan          # fill the calendar, print it
 *   npx tsx scripts/test-occasion-agent.ts calendar      # just print what is planned
 *   npx tsx scripts/test-occasion-agent.ts generate <id> # render artwork for one post
 *   npx tsx scripts/test-occasion-agent.ts publish       # publish anything actually due
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true, quiet: true });

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  const { planAhead, generateFor, publishDue } = await import("../lib/social/occasion/agent");
  const { createAdminClient } = await import("../lib/supabase/server");
  const sb = createAdminClient() as never as {
    from: (t: string) => {
      select: (c: string) => {
        gte: (a: string, b: string) => {
          order: (c: string, o: { ascending: boolean }) => Promise<{ data: Record<string, unknown>[] | null }>;
        };
      };
    };
  };

  async function printCalendar() {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await sb
      .from("social_occasion_posts")
      .select("id, occasion_date, occasion_name, status, image_url, product_id")
      .gte("occasion_date", today)
      .order("occasion_date", { ascending: true });
    console.log(`\n${(data ?? []).length} planned from ${today}\n`);
    for (const r of data ?? []) {
      console.log(
        `${r.occasion_date}  ${String(r.status).padEnd(10)}  ${String(r.occasion_name).padEnd(26)}  ${r.image_url ? "art ✓" : "art —"}  ${r.id}`,
      );
    }
  }

  switch (cmd) {
    case "plan": {
      const res = await planAhead();
      console.log("planned:", JSON.stringify(res));
      await printCalendar();
      break;
    }
    case "calendar":
      await printCalendar();
      break;
    case "generate": {
      if (!arg) { console.error("need a post id"); process.exit(1); }
      console.log("generating…");
      const res = await generateFor(arg);
      console.log(JSON.stringify(res));
      break;
    }
    case "publish": {
      const res = await publishDue();
      console.log(JSON.stringify(res));
      break;
    }
    default:
      console.log("commands: plan | calendar | generate <id> | publish");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
