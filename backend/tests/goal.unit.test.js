const {
  parseDateLabel,
  calcProgressPercent,
  calcProjectedSavings,
  calcStatus,
  calcAdvisoryInputs,
} = require('../utils/financialEngine');

describe('Goal unit tests - financialEngine', () => {
  test('UT-01: parseDateLabel returns correct Date for YYYY-MM', () => {
    const d = parseDateLabel('2026-12');
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(11); // zero-based month
  });

  test('UT-02: calcProgressPercent computes percentage correctly', () => {
    expect(calcProgressPercent(50, 100)).toBe(50);
    expect(calcProgressPercent(150, 100)).toBe(100);
    expect(calcProgressPercent(0, 0)).toBe(0);
  });

  test('UT-03: calcProjectedSavings sums savings and monthly*months', () => {
    expect(calcProjectedSavings(100, 50, 3)).toBe(250);
  });

  test('UT-04: calcStatus returns expected categories', () => {
    // completed
    expect(calcStatus(1000, 500, 1500)).toBe('completed');
    // on-track (projected >= target)
    expect(calcStatus(100, 500, 600)).toBe('on-track');
    // at-risk (projected >= 80% and < target)
    expect(calcStatus(100, 1000, 850)).toBe('at-risk');
    // high-risk
    expect(calcStatus(0, 1000, 500)).toBe('high-risk');
  });

  test('UT-05: calcAdvisoryInputs returns options when deficit exists', () => {
    const goal = { target: 1000, savings: 100, monthly: 50 };
    const remainingMonths = 5; // projectedSavings = 100 + 50*5 = 350 -> deficit 650
    const adv = calcAdvisoryInputs(goal, remainingMonths);
    expect(adv.deficit).toBeGreaterThan(0);
    expect(adv.optionA).not.toBeNull();
    expect(adv.optionB).not.toBeNull();
    expect(typeof adv.optionA.extraMonths === 'number' || adv.optionA.extraMonths === null).toBe(true);
  });
});
