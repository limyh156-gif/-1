import { useState, useEffect } from "react";

const LOAN_TYPES = [
  {
    id: "looks",
    name: "외모 대출",
    icon: "✨",
    unit: "pt",
    maxPerLoan: 30,
    interestRate: 0.25,
    description: "지금 당장 빛나고 싶다면",
    collateral: "미래의 외모가 낡아갑니다",
    specLabel: "외모 지수",
    baseSpec: 100,
    damageMessages: [
      "피부가 칙칙해지기 시작합니다",
      "눈 밑 다크서클이 생겼습니다",
      "머리카락이 윤기를 잃어갑니다",
      "얼굴에 피로감이 배어납니다",
    ],
    recoverMessages: [
      "피부에 생기가 돌아옵니다",
      "눈빛이 다시 빛나기 시작합니다",
    ],
  },
  {
    id: "luck",
    name: "성공운 대출",
    icon: "🍀",
    unit: "pt",
    maxPerLoan: 20,
    interestRate: 0.38,
    description: "오늘 하루만 운이 좋다면",
    collateral: "미래의 기회가 줄어듭니다",
    specLabel: "성공운 지수",
    baseSpec: 100,
    damageMessages: [
      "버스를 놓치기 시작합니다",
      "중요한 기회를 놓쳤습니다",
      "타이밍이 어긋나기 시작합니다",
    ],
    recoverMessages: ["작은 행운이 돌아옵니다", "기회가 다시 찾아옵니다"],
  },
  {
    id: "grades",
    name: "성적 대출",
    icon: "📈",
    unit: "pt",
    maxPerLoan: 15,
    interestRate: 0.42,
    description: "이번 시험만 잘 보고 싶다면",
    collateral: "미래의 실력이 흔들립니다",
    specLabel: "학습 능력",
    baseSpec: 100,
    damageMessages: ["집중력이 흐려집니다", "배운 것이 잘 기억나지 않습니다"],
    recoverMessages: ["집중력이 회복됩니다", "기억력이 돌아옵니다"],
  },
  {
    id: "love",
    name: "연애운 대출",
    icon: "💘",
    unit: "pt",
    maxPerLoan: 25,
    interestRate: 0.3,
    description: "지금 이 순간 사랑받고 싶다면",
    collateral: "미래의 인연이 멀어집니다",
    specLabel: "연애운 지수",
    baseSpec: 100,
    damageMessages: [
      "좋아하는 사람과 엇갈립니다",
      "연락이 뜸해지기 시작합니다",
      "두근거림이 사라져 갑니다",
      "인연이 스쳐 지나갑니다",
    ],
    recoverMessages: [
      "설레는 감정이 돌아옵니다",
      "인연의 실이 다시 이어집니다",
    ],
  },
];

function getFutureStatus(totalDebt) {
  if (totalDebt === 0)
    return { label: "완벽한 미래", color: "#00ffaa", emoji: "🌟", grade: "S" };
  if (totalDebt < 30)
    return { label: "약간 흔들림", color: "#aaff00", emoji: "😊", grade: "A" };
  if (totalDebt < 70)
    return { label: "균열 발생", color: "#ffdd00", emoji: "😐", grade: "B" };
  if (totalDebt < 120)
    return { label: "위험 수위", color: "#ff8800", emoji: "😟", grade: "C" };
  if (totalDebt < 180)
    return { label: "심각한 붕괴", color: "#ff4400", emoji: "😰", grade: "D" };
  return { label: "미래 파산", color: "#ff0044", emoji: "💀", grade: "F" };
}

// 만기일 계산: borrowedAt 기준 months개월 후
function getDueDate(borrowedAt, months) {
  const d = new Date(borrowedAt);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

// 남은 시간 포맷
function formatRemaining(dueTs) {
  const now = Date.now();
  const diff = dueTs - now;
  if (diff <= 0) return { text: "만기 초과!", overdue: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0)
    return { text: `${days}일 ${hours}시간 후 차감`, overdue: false };
  const mins = Math.floor((diff % 3600000) / 60000);
  return { text: `${hours}시간 ${mins}분 후 차감`, overdue: false };
}

function SpecBar({ label, icon, currentValue, futureValue }) {
  const cur = Math.max(0, Math.min(100, currentValue));
  const fut = Math.max(0, Math.min(100, futureValue));
  const curColor = cur > 70 ? "#00ffaa" : cur > 50 ? "#aaff00" : "#ffdd00";
  const futColor = fut > 60 ? "#5588ff" : fut > 30 ? "#ff8844" : "#ff4444";
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#888",
          marginBottom: 8,
        }}
      >
        <span>
          {icon} {label}
        </span>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ color: curColor, fontWeight: 700 }}>
            현재 {cur.toFixed(0)}
          </span>
          <span style={{ color: "#2a2a3e" }}>|</span>
          <span style={{ color: futColor, fontWeight: 700 }}>
            미래 {fut.toFixed(0)}
          </span>
        </div>
      </div>
      <div style={{ marginBottom: 5 }}>
        <div
          style={{
            fontSize: 9,
            color: "#444",
            marginBottom: 3,
            letterSpacing: 2,
          }}
        >
          현재
        </div>
        <div
          style={{
            height: 6,
            background: "#1a1a2e",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${cur}%`,
              background: `linear-gradient(90deg, ${curColor}, ${curColor}88)`,
              borderRadius: 3,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 9,
            color: "#333",
            marginBottom: 3,
            letterSpacing: 2,
          }}
        >
          미래
        </div>
        <div
          style={{
            height: 6,
            background: "#1a1a2e",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${fut}%`,
              background: `linear-gradient(90deg, ${futColor}, ${futColor}88)`,
              borderRadius: 3,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const STORAGE_KEY = "mirae_capital_loans_v3";

export default function FutureCapital() {
  const [loans, setLoans] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [selectedType, setSelectedType] = useState(LOAN_TYPES[0]);
  const [amount, setAmount] = useState(10);
  const [months, setMonths] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRepayConfirm, setShowRepayConfirm] = useState(null);
  const [autoDueAlert, setAutoDueAlert] = useState([]); // 자동 차감된 대출 목록
  const [eventLog, setEventLog] = useState([]);
  const [glitchActive, setGlitchActive] = useState(false);
  const [tab, setTab] = useState("borrow");
  const [now, setNow] = useState(Date.now());

  // 1분마다 시간 갱신 (D-day 카운트 업데이트)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // localStorage 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  }, [loans]);

  // 앱 켤 때마다 만기 초과 대출 자동 차감 체크
  useEffect(() => {
    const overdue = loans.filter(
      (l) => !l.repaid && !l.autoCharged && l.dueAt <= Date.now()
    );
    if (overdue.length > 0) {
      setLoans((prev) =>
        prev.map((l) =>
          overdue.find((o) => o.id === l.id) ? { ...l, autoCharged: true } : l
        )
      );
      setAutoDueAlert(overdue);
      overdue.forEach((l) => {
        const msgs = l.type.damageMessages;
        addLog(msgs[Math.floor(Math.random() * msgs.length)], l.type, "damage");
      });
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 1200);
    }
  }, []);

  const activeLoans = loans.filter((l) => !l.repaid);
  // 자동차감 포함 미래 부채: autoCharged는 이미 차감됐으므로 미래 스펙에는 반영, 상환은 아직 안 됨
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.totalRepay, 0);
  const futureStatus = getFutureStatus(totalDebt);

  const specs = LOAN_TYPES.map((type) => {
    const borrowed = activeLoans
      .filter((l) => l.type.id === type.id)
      .reduce((s, l) => s + l.amount, 0);
    const debt = activeLoans
      .filter((l) => l.type.id === type.id)
      .reduce((s, l) => s + l.totalRepay, 0);
    const repaid = loans
      .filter((l) => l.repaid && l.type.id === type.id)
      .reduce((s, l) => s + l.totalRepay, 0);
    return {
      ...type,
      currentValue: Math.max(0, Math.min(100, 50 + borrowed - repaid)),
      futureValue: Math.max(0, type.baseSpec - debt),
    };
  });

  const handleBorrow = () => {
    const borrowedAt = Date.now();
    const dueAt = getDueDate(borrowedAt, months);
    const interest = Math.round(amount * months * selectedType.interestRate);
    const totalRepay = amount + interest; // 원금 + 이자
    const newLoan = {
      id: borrowedAt,
      type: selectedType,
      amount, // 원금 (지금 받는 것)
      months,
      interest,
      totalRepay,
      borrowedAt,
      dueAt,
      repaid: false,
      autoCharged: false,
      date: new Date(borrowedAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
    setLoans((prev) => [newLoan, ...prev]);
    addLog(
      selectedType.damageMessages[
        Math.floor(Math.random() * selectedType.damageMessages.length)
      ],
      selectedType,
      "damage"
    );
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 800);
    setShowConfirm(false);
    setTab("spec");
  };

  const handleRepay = (loan) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loan.id ? { ...l, repaid: true } : l))
    );
    addLog(
      loan.type.recoverMessages[
        Math.floor(Math.random() * loan.type.recoverMessages.length)
      ],
      loan.type,
      "recover"
    );
    setShowRepayConfirm(null);
  };

  const addLog = (text, type, kind) => {
    setEventLog((prev) => [
      { id: Date.now(), text, type, kind },
      ...prev.slice(0, 14),
    ]);
  };

  const futureHealth = Math.max(0, 100 - Math.min(100, totalDebt / 2));
  const previewInterest = Math.round(
    amount * months * selectedType.interestRate
  );
  const previewRepay = amount + previewInterest;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        fontFamily: "'Courier New', monospace",
        color: "#e0e0e0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 0 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scanlines */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {glitchActive && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255,0,68,0.08)",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      )}

      {/* 자동 차감 알림 */}
      {autoDueAlert.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#100808",
              border: "2px solid #ff4444",
              borderTop: "4px solid #ff0000",
              padding: 32,
              borderRadius: 2,
              maxWidth: 380,
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 12,
                letterSpacing: 4,
                color: "#ff4444",
                marginBottom: 16,
              }}
            >
              🔴 만기 자동 차감 알림
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 16,
              }}
            >
              미래에서 빌린 것들이 만기를 넘겼습니다
            </div>
            {autoDueAlert.map((l) => (
              <div
                key={l.id}
                style={{
                  padding: "10px 14px",
                  marginBottom: 8,
                  background: "#1a0808",
                  border: "1px solid #ff444433",
                  borderRadius: 2,
                }}
              >
                <div style={{ fontSize: 13, color: "#ff8866" }}>
                  {l.type.icon} {l.type.name} —{" "}
                  <span style={{ color: "#ff4444", fontWeight: 700 }}>
                    {l.totalRepay} pt
                  </span>{" "}
                  미래에서 차감됨
                </div>
                <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
                  {l.months}개월 전 대출 · 만기 도래
                </div>
              </div>
            ))}
            <div
              style={{
                fontSize: 12,
                color: "#884444",
                marginTop: 16,
                marginBottom: 20,
                lineHeight: 1.8,
              }}
            >
              이 빚은 현재의 당신이 살아가며 갚아야 합니다.
              <br />
              상환하지 않으면 미래는 계속 무너집니다.
            </div>
            <button
              onClick={() => {
                setAutoDueAlert([]);
                setTab("repay");
              }}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #ff444411, #ff444433)",
                border: "1px solid #ff444466",
                color: "#ff6666",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                borderRadius: 2,
              }}
            >
              확인 — 상환 탭으로 이동
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 480, padding: "32px 24px 0" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 6,
            color: "#444",
            marginBottom: 4,
          }}
        >
          MIRAE CAPITAL CORP.
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: -1,
            color: "#fff",
            margin: 0,
            textShadow: glitchActive ? "3px 0 #ff0044, -3px 0 #00ffff" : "none",
          }}
        >
          미래 캐피탈{" "}
          <span style={{ color: futureStatus.color, fontSize: 18 }}>
            {futureStatus.emoji}
          </span>
        </h1>
        <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>
          당신의 미래를 담보로 현재를 빌려드립니다
        </div>
      </div>

      {/* Status Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "20px 24px 0",
          padding: "20px 24px",
          background: "#0d0d18",
          border: `1px solid ${futureStatus.color}33`,
          borderLeft: `3px solid ${futureStatus.color}`,
          borderRadius: 2,
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: 4,
            color: "#333",
            marginBottom: 10,
          }}
        >
          미래 상태 진단
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: futureStatus.color,
              }}
            >
              {futureStatus.label}
            </div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>
              미래부채: <span style={{ color: "#ff8844" }}>{totalDebt} pt</span>{" "}
              · 대출 {activeLoans.length}건
            </div>
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              border: `2px solid ${futureStatus.color}44`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 900,
              color: futureStatus.color,
              background: `${futureStatus.color}11`,
            }}
          >
            {futureStatus.grade}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "#333",
              marginBottom: 5,
            }}
          >
            <span>미래 건강도</span>
            <span style={{ color: futureStatus.color }}>
              {futureHealth.toFixed(0)}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: "#1a1a2e",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${futureHealth}%`,
                background: `linear-gradient(90deg, ${futureStatus.color}, ${futureStatus.color}88)`,
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          margin: "20px 24px 0",
          borderBottom: "1px solid #1a1a2e",
        }}
      >
        {[
          ["borrow", "대출"],
          ["repay", `상환(${activeLoans.length})`],
          ["spec", "현재 스펙"],
          ["history", "내역"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: "11px 0",
              background: "none",
              border: "none",
              borderBottom:
                tab === key ? "2px solid #00ffaa" : "2px solid transparent",
              color: tab === key ? "#00ffaa" : "#444",
              fontSize: 11,
              letterSpacing: 1,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ──────────── TAB: 대출 ──────────── */}
      {tab === "borrow" && (
        <div style={{ width: "100%", maxWidth: 480, padding: "0 24px" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: "#333",
              margin: "24px 0 12px",
            }}
          >
            대출 상품
          </div>
          {LOAN_TYPES.map((type) => (
            <div
              key={type.id}
              onClick={() => setSelectedType(type)}
              style={{
                padding: "14px 18px",
                marginBottom: 8,
                background: selectedType.id === type.id ? "#111120" : "#0d0d14",
                border:
                  selectedType.id === type.id
                    ? "1px solid #00ffaa44"
                    : "1px solid #1a1a2e",
                borderLeft:
                  selectedType.id === type.id
                    ? "3px solid #00ffaa"
                    : "3px solid transparent",
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{type.icon}</span>
                  <div>
                    <div
                      style={{ fontSize: 13, fontWeight: 700, color: "#ddd" }}
                    >
                      {type.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#444" }}>
                      {type.description}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontSize: 12, color: "#ff8844", fontWeight: 700 }}
                  >
                    월 {(type.interestRate * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 9, color: "#333" }}>월이율</div>
                </div>
              </div>
              {selectedType.id === type.id && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 10,
                    borderTop: "1px solid #1a1a2e",
                    fontSize: 10,
                    color: "#ff444466",
                  }}
                >
                  ⚠ {type.collateral}
                </div>
              )}
            </div>
          ))}

          {/* 설정 카드 */}
          <div
            style={{
              padding: "20px",
              marginTop: 8,
              background: "#0d0d14",
              border: "1px solid #1a1a2e",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 4,
                color: "#333",
                marginBottom: 18,
              }}
            >
              대출 설정
            </div>

            {/* 원금 슬라이더 */}
            <div style={{ marginBottom: 22 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#555" }}>
                  원금 (지금 받는 것)
                </span>
                <span
                  style={{ fontSize: 24, fontWeight: 900, color: "#00ffaa" }}
                >
                  {amount}{" "}
                  <span style={{ fontSize: 11, color: "#444" }}>pt</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={selectedType.maxPerLoan}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#00ffaa",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 9,
                  color: "#333",
                  marginTop: 3,
                }}
              >
                <span>1 pt</span>
                <span>{selectedType.maxPerLoan} pt</span>
              </div>
            </div>

            {/* 개월 슬라이더 */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#555" }}>대출 기간</span>
                <span
                  style={{ fontSize: 24, fontWeight: 900, color: "#ffdd00" }}
                >
                  {months}{" "}
                  <span style={{ fontSize: 11, color: "#444" }}>개월</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#ffdd00",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 9,
                  color: "#333",
                  marginTop: 3,
                }}
              >
                <span>1개월</span>
                <span>12개월</span>
              </div>
            </div>

            {/* 계산 요약 */}
            <div
              style={{
                padding: "14px 16px",
                background: "#080812",
                border: "1px solid #ffffff0d",
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: "#444" }}>
                  지금 수령 (원금)
                </span>
                <span
                  style={{ fontSize: 13, color: "#00ffaa", fontWeight: 700 }}
                >
                  +{amount} pt
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: "#444" }}>
                  이자 ({months}개월 ×{" "}
                  {(selectedType.interestRate * 100).toFixed(0)}%)
                </span>
                <span
                  style={{ fontSize: 13, color: "#ff8844", fontWeight: 700 }}
                >
                  +{previewInterest} pt
                </span>
              </div>
              <div
                style={{ height: 1, background: "#1a1a2e", margin: "8px 0" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#888" }}>
                  만기 후 미래에서 차감
                </span>
                <span
                  style={{ fontSize: 14, color: "#ff4444", fontWeight: 700 }}
                >
                  -{previewRepay} pt
                </span>
              </div>
              <div style={{ fontSize: 10, color: "#333", marginTop: 8 }}>
                📅 만기일:{" "}
                {new Date(getDueDate(Date.now(), months)).toLocaleDateString(
                  "ko-KR",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            style={{
              width: "100%",
              padding: "15px",
              marginTop: 10,
              background: "linear-gradient(135deg, #00ffaa11, #00ffaa22)",
              border: "1px solid #00ffaa44",
              color: "#00ffaa",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 3,
              cursor: "pointer",
              borderRadius: 2,
            }}
          >
            미래를 담보로 대출받기
          </button>
        </div>
      )}

      {/* ──────────── TAB: 상환 ──────────── */}
      {tab === "repay" && (
        <div style={{ width: "100%", maxWidth: 480, padding: "0 24px" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: "#333",
              margin: "24px 0 16px",
            }}
          >
            상환 대기 목록
          </div>
          {activeLoans.length === 0 ? (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                color: "#333",
                fontSize: 13,
              }}
            >
              상환할 대출이 없습니다 🌟
            </div>
          ) : (
            activeLoans.map((loan) => {
              const remaining = formatRemaining(loan.dueAt);
              return (
                <div
                  key={loan.id}
                  style={{
                    padding: "16px 18px",
                    marginBottom: 10,
                    background: "#0d0d14",
                    border: `1px solid ${
                      remaining.overdue ? "#ff444444" : "#1a1a2e"
                    }`,
                    borderLeft: `3px solid ${
                      remaining.overdue
                        ? "#ff4444"
                        : loan.autoCharged
                        ? "#ff8844"
                        : "#555"
                    }`,
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span>{loan.type.icon}</span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#ccc",
                          }}
                        >
                          {loan.type.name}
                        </span>
                        {loan.autoCharged && (
                          <span
                            style={{
                              fontSize: 9,
                              color: "#ff4444",
                              letterSpacing: 1,
                              background: "#ff444422",
                              padding: "2px 6px",
                              borderRadius: 2,
                            }}
                          >
                            만기차감
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "#444" }}>
                        대출일: {loan.date} · {loan.months}개월
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: remaining.overdue ? "#ff4444" : "#555",
                          marginTop: 4,
                        }}
                      >
                        ⏱ {remaining.text}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#ff8844", marginTop: 4 }}
                      >
                        원금 {loan.amount} + 이자 {loan.interest} ={" "}
                        <span style={{ fontWeight: 700 }}>
                          {loan.totalRepay} pt
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowRepayConfirm(loan)}
                      style={{
                        padding: "8px 14px",
                        marginLeft: 12,
                        background:
                          "linear-gradient(135deg, #ff444411, #ff444422)",
                        border: "1px solid #ff444444",
                        color: "#ff8866",
                        fontSize: 11,
                        cursor: "pointer",
                        borderRadius: 2,
                        letterSpacing: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      상환하기
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {loans.filter((l) => l.repaid).length > 0 && (
            <>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 4,
                  color: "#222",
                  margin: "24px 0 12px",
                }}
              >
                상환 완료
              </div>
              {loans
                .filter((l) => l.repaid)
                .map((loan) => (
                  <div
                    key={loan.id}
                    style={{
                      padding: "12px 18px",
                      marginBottom: 8,
                      background: "#0a0a10",
                      border: "1px solid #111",
                      borderLeft: "3px solid #222",
                      borderRadius: 2,
                      opacity: 0.4,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#333" }}>
                        {loan.type.icon} {loan.type.name} · {loan.months}개월
                      </span>
                      <span style={{ fontSize: 11, color: "#2a2a2a" }}>
                        상환 완료 ✓
                      </span>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      )}

      {/* ──────────── TAB: 현재 스펙 ──────────── */}
      {tab === "spec" && (
        <div style={{ width: "100%", maxWidth: 480, padding: "0 24px" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: "#333",
              margin: "24px 0 6px",
            }}
          >
            현재 나의 스펙
          </div>
          <div style={{ fontSize: 11, color: "#333", marginBottom: 20 }}>
            대출받은 만큼 현재↑ · 미래↓
          </div>
          <div
            style={{
              padding: "24px",
              background: "#0d0d18",
              border: "1px solid #1a1a2e",
              borderRadius: 2,
            }}
          >
            {specs.map((s) => (
              <SpecBar
                key={s.id}
                label={s.specLabel}
                icon={s.icon}
                currentValue={s.currentValue}
                futureValue={s.futureValue}
              />
            ))}
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "18px 24px",
              background: "#0d0d18",
              border: "1px solid #1a1a2e",
              borderRadius: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 3,
                  color: "#333",
                  marginBottom: 6,
                }}
              >
                종합 현재 스펙
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: futureStatus.color,
                }}
              >
                {Math.round(
                  specs.reduce((s, x) => s + x.currentValue, 0) / specs.length
                )}
              </div>
            </div>
            <div style={{ fontSize: 36 }}>{futureStatus.emoji}</div>
          </div>
          {eventLog.length > 0 && (
            <>
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: 4,
                  color: "#333",
                  margin: "20px 0 12px",
                }}
              >
                최근 변화
              </div>
              {eventLog.slice(0, 5).map((log, i) => (
                <div
                  key={log.id}
                  style={{
                    padding: "10px 16px",
                    marginBottom: 6,
                    background: "#0d0d14",
                    border: `1px solid ${
                      log.kind === "recover" ? "#00ffaa22" : "#ff444422"
                    }`,
                    borderLeft: `3px solid ${
                      log.kind === "recover" ? "#00ffaa" : "#ff4444"
                    }`,
                    borderRadius: 2,
                    opacity: 1 - i * 0.15,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      color: log.kind === "recover" ? "#00ffaa66" : "#ff444466",
                      letterSpacing: 2,
                      marginBottom: 3,
                    }}
                  >
                    {log.kind === "recover" ? "▲ 회복" : "▼ 피해"} [
                    {log.type.name}]
                  </div>
                  <div style={{ fontSize: 12, color: "#bbb" }}>{log.text}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ──────────── TAB: 내역 ──────────── */}
      {tab === "history" && (
        <div style={{ width: "100%", maxWidth: 480, padding: "0 24px" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 4,
              color: "#333",
              margin: "24px 0 16px",
            }}
          >
            전체 거래 내역 ({loans.length}건)
          </div>
          {loans.length === 0 ? (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                color: "#333",
                fontSize: 13,
              }}
            >
              내역이 없습니다
            </div>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                style={{
                  padding: "14px 18px",
                  marginBottom: 8,
                  background: "#0d0d14",
                  border: `1px solid ${loan.repaid ? "#111" : "#1a1a2e"}`,
                  borderLeft: `3px solid ${loan.repaid ? "#222" : "#ff8844"}`,
                  borderRadius: 2,
                  opacity: loan.repaid ? 0.4 : 1,
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span>{loan.type.icon}</span>
                      <span
                        style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}
                      >
                        {loan.type.name}
                      </span>
                      {loan.repaid && (
                        <span style={{ fontSize: 9, color: "#333" }}>완료</span>
                      )}
                      {loan.autoCharged && !loan.repaid && (
                        <span style={{ fontSize: 9, color: "#ff4444" }}>
                          만기차감
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "#333", marginTop: 3 }}>
                      {loan.date} · {loan.months}개월
                    </div>
                    <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
                      만기:{" "}
                      {new Date(loan.dueAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#00ffaa",
                        fontWeight: 700,
                      }}
                    >
                      +{loan.amount} pt
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: loan.repaid ? "#333" : "#ff4444",
                      }}
                    >
                      미래 -{loan.totalRepay} pt
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 대출 확인 모달 */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#0d0d18",
              border: "1px solid #ff444444",
              borderTop: "3px solid #ff4444",
              padding: 28,
              borderRadius: 2,
              maxWidth: 360,
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 4,
                color: "#ff4444",
                marginBottom: 14,
              }}
            >
              ⚠ 대출 계약 확인
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 14,
              }}
            >
              {selectedType.icon} {selectedType.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#666",
                lineHeight: 2.1,
                marginBottom: 14,
              }}
            >
              <span style={{ color: "#aaa" }}>지금 수령 (원금)</span>　
              <span style={{ color: "#00ffaa", fontWeight: 700 }}>
                +{amount} pt
              </span>
              <br />
              <span style={{ color: "#aaa" }}>대출 기간</span>　
              <span style={{ color: "#ffdd00", fontWeight: 700 }}>
                {months}개월
              </span>
              <br />
              <span style={{ color: "#aaa" }}>이자</span>　
              <span style={{ color: "#ff8844", fontWeight: 700 }}>
                +{previewInterest} pt
              </span>
              <br />
              <span style={{ color: "#aaa" }}>만기 차감 총액</span>　
              <span style={{ color: "#ff4444", fontWeight: 700 }}>
                -{previewRepay} pt
              </span>
              <br />
              <span style={{ color: "#aaa" }}>만기일</span>　
              <span style={{ color: "#888", fontWeight: 700 }}>
                {new Date(getDueDate(Date.now(), months)).toLocaleDateString(
                  "ko-KR"
                )}
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#ff444466",
                padding: "10px 14px",
                background: "#ff444408",
                border: "1px solid #ff444422",
                borderRadius: 2,
                marginBottom: 20,
              }}
            >
              {selectedType.collateral}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "none",
                  border: "1px solid #222",
                  color: "#444",
                  cursor: "pointer",
                  fontSize: 12,
                  borderRadius: 2,
                }}
              >
                취소
              </button>
              <button
                onClick={handleBorrow}
                style={{
                  flex: 2,
                  padding: "11px",
                  background: "linear-gradient(135deg, #ff444411, #ff444422)",
                  border: "1px solid #ff444444",
                  color: "#ff6666",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  borderRadius: 2,
                }}
              >
                미래를 담보로 대출
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상환 확인 모달 */}
      {showRepayConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.93)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#0d0d18",
              border: "1px solid #ff444466",
              borderTop: "3px solid #ff4444",
              padding: 28,
              borderRadius: 2,
              maxWidth: 360,
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "#ff4444",
                marginBottom: 16,
              }}
            >
              ⚠ 상환 경고
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 16,
              }}
            >
              {showRepayConfirm.type.icon} {showRepayConfirm.type.name}
            </div>
            <div
              style={{
                padding: "14px 16px",
                marginBottom: 18,
                background: "#1a0808",
                border: "1px solid #ff444433",
                borderLeft: "3px solid #ff4444",
                borderRadius: 2,
                fontSize: 12,
                color: "#ff8866",
                lineHeight: 2.0,
              }}
            >
              ⚡ 미래에서 빌린{" "}
              <span style={{ color: "#ffdd00", fontWeight: 700 }}>
                {showRepayConfirm.months}개월
              </span>
              치의 {showRepayConfirm.type.name}을<br />
              지금 이 순간부터{" "}
              <span style={{ color: "#ff4444", fontWeight: 700 }}>
                현재를 살아가며 직접 갚아야 합니다.
              </span>
              <br />
              <br />
              원금{" "}
              <span style={{ color: "#aaa", fontWeight: 700 }}>
                {showRepayConfirm.amount} pt
              </span>{" "}
              + 이자{" "}
              <span style={{ color: "#ff8844", fontWeight: 700 }}>
                {showRepayConfirm.interest} pt
              </span>{" "}
              = 총{" "}
              <span style={{ color: "#ff4444", fontWeight: 700 }}>
                {showRepayConfirm.totalRepay} pt
              </span>
              를<br />
              현재의 당신이 감당해야 합니다.
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#555",
                marginBottom: 20,
                lineHeight: 1.8,
              }}
            >
              상환 후 미래가 회복되지만, 그 무게는
              <br />
              고스란히 현재의 당신 몫입니다.
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#777",
                marginBottom: 20,
                textAlign: "center",
                letterSpacing: 2,
              }}
            >
              정말 상환하시겠습니까?
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowRepayConfirm(null)}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "#111",
                  border: "1px solid #333",
                  color: "#888",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 2,
                  letterSpacing: 3,
                }}
              >
                아니요
              </button>
              <button
                onClick={() => handleRepay(showRepayConfirm)}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: "linear-gradient(135deg, #ff444411, #ff444422)",
                  border: "1px solid #ff444455",
                  color: "#ff6666",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 2,
                  letterSpacing: 3,
                }}
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        input[type=range] { -webkit-appearance: none; height: 4px; background: #1a1a2e; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; background: #00ffaa; border-radius: 50%; cursor: pointer; }
      `}</style>
    </div>
  );
}
