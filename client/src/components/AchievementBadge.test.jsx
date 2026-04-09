import { render, screen } from '@testing-library/react';
import AchievementBadge from './AchievementBadge';

test('renders unlocked achievement', () => {
  render(
    <AchievementBadge
      title="初次记录"
      description="完成第一条学习记录"
      icon="⭐"
      isUnlocked
      progress={1}
      target={1}
    />
  );
  expect(screen.getByText('初次记录')).toBeInTheDocument();
  expect(screen.getByText('⭐')).toBeInTheDocument();
});

test('renders locked achievement with progress', () => {
  render(
    <AchievementBadge
      title="学习达人"
      description=""
      icon="🏆"
      isUnlocked={false}
      progress={3}
      target={10}
    />
  );
  expect(screen.getByText('未达成')).toBeInTheDocument();
  expect(screen.getByText('3/10')).toBeInTheDocument();
});

test('renders hidden achievement as question mark', () => {
  render(
    <AchievementBadge
      title="???"
      description="隐藏成就"
      icon="❓"
      isUnlocked={false}
      progress={0}
      target={3}
    />
  );
  expect(screen.getByText('隐藏成就')).toBeInTheDocument();
});
