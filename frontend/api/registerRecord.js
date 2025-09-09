import supabase from "../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { playerName, clearFloor, clearTime, clearTimeAfterParse, date } = req.body;

  if (!playerName || clearFloor === undefined || clearTime === undefined || !clearTimeAfterParse || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 1. 新しいスコアを挿入
  const { error: insertError } = await supabase.from("scores").insert([
    {
      playername: playerName,
      clearfloor: clearFloor,
      cleartime: clearTime,
      cleartimeafterparse: clearTimeAfterParse,
      date,
    }
  ]);

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  // 2. ランキングを取得
  const { data: rows, error: selectError } = await supabase
    .from("scores")
    .select("*")
    .order("clearfloor", { ascending: false })
    .order("cleartime", { ascending: true })
    .order("date", { ascending: true });

  if (selectError) {
    return res.status(500).json({ error: selectError.message });
  }

  // 3. 上位5件以降を削除
  if (rows.length > 5) {
    const idsToDelete = rows.slice(5).map((r) => r.id);
    await supabase.from("scores").delete().in("id", idsToDelete);
  }

  // 4. 上位5件を返す
  return res.status(200).json(rows.slice(0, 5));
}
