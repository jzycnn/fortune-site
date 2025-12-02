const tarotCards = [
  { name: "愚者", img: "assets/tarot-cards/0_The_Fool.jpg", meaning: "新的开始，冒险，自由" },
  { name: "魔术师", img: "assets/tarot-cards/1_The_Magician.jpg", meaning: "创造力，意志力，行动" },
  { name: "女祭司", img: "assets/tarot-cards/2_The_High_Priestess.jpg", meaning: "直觉，潜意识，内在智慧" },
  { name: "皇后", img: "assets/tarot-cards/3_The_Empress.jpg", meaning: "丰盛，母性，自然之力" },
  { name: "皇帝", img: "assets/tarot-cards/4_The_Emporer.jpg", meaning: "权威，控制，秩序" },
  { name: "教皇", img: "assets/tarot-cards/5_The_Hierophant.jpg", meaning: "传统，信仰，指导" },
  { name: "恋人", img: "assets/tarot-cards/6_The_Lovers.jpg", meaning: "爱，选择，和谐" },
  { name: "战车", img: "assets/tarot-cards/7_Chariot.jpg", meaning: "意志力，胜利，前进" },
  { name: "力量", img: "assets/tarot-cards/8_Strength.jpg", meaning: "勇气，耐心，内在力量" },
  { name: "隐士", img: "assets/tarot-cards/9_The_Hermit.jpg", meaning: "内省，智慧，孤独" }
];

function drawCards() {
  const question = document.getElementById("question").value.trim();
  if (!question) {
    alert("请先输入问题！");
    return;
  }

  // 随机抽3张牌（不重复）
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
  const cards = shuffled.slice(0, 3);

  // 跳转到结果页（或直接弹出）
  window.location.href = `result.html?cards=${encodeURIComponent(JSON.stringify(cards))}`;
}
