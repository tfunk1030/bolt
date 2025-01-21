export const CLUB_AVERAGES = {
  "driver": {
    carry: 295.3,
    total_distance: 309.3,
    ball_speed: 171.8,
    back_spin: 2271.9,
    side_spin: -226.3,
    vla: 10.8,  // Vertical Launch Angle
    descent_angle: 37.8,
    peak_height: 36.0, // Converted to yards
    club_speed: 119.9
  },
  "3-wood": {
    carry: 258.8,
    total_distance: 269.6,
    ball_speed: 160.6,
    back_spin: 3424.6,
    side_spin: 256.0,
    vla: 10.5,
    descent_angle: 42.4,
    peak_height: 35.9,
    club_speed: 110.5
  },
  "5-wood": {
    carry: 233.1,
    total_distance: 245.4,
    ball_speed: 145.9,
    back_spin: 3206.6,
    side_spin: 56.0,
    vla: 11.2,
    descent_angle: 39.2,
    peak_height: 29.9,
    club_speed: null
  },
  "4-iron": {
    carry: 210.6,
    total_distance: 218.8,
    ball_speed: 137.5,
    back_spin: 3930.8,
    side_spin: 465.8,
    vla: 12.0,
    descent_angle: 40.3,
    peak_height: 29.3,
    club_speed: null
  },
  "5-iron": {
    carry: 203.4,
    total_distance: 209.6,
    ball_speed: 133.5,
    back_spin: 4209.3,
    side_spin: 118.3,
    vla: 13.6,
    descent_angle: 42.6,
    peak_height: 31.5,
    club_speed: null
  },
  "6-iron": {
    carry: 192.0,
    total_distance: 197.5,
    ball_speed: 129.2,
    back_spin: 4881.1,
    side_spin: 90.7,
    vla: 15.9,
    descent_angle: 46.2,
    peak_height: 34.5,
    club_speed: null
  },
  "7-iron": {
    carry: 175.4,
    total_distance: 180.9,
    ball_speed: 122.9,
    back_spin: 5886.4,
    side_spin: 175.2,
    vla: 17.8,
    descent_angle: 48.2,
    peak_height: 34.3,
    club_speed: null
  },
  "8-iron": {
    carry: 156.0,
    total_distance: 162.7,
    ball_speed: 116.7,
    back_spin: 6548.7,
    side_spin: -222.2,
    vla: 20.2,
    descent_angle: 47.3,
    peak_height: 33.6,
    club_speed: 85.6
  },
  "9-iron": {
    carry: 147.8,
    total_distance: 153.1,
    ball_speed: 109.5,
    back_spin: 7407.3,
    side_spin: 247.3,
    vla: 21.6,
    descent_angle: 49.6,
    peak_height: 32.9,
    club_speed: null
  },
  "pitching-wedge": {
    carry: 134.9,
    total_distance: 138.6,
    ball_speed: 102.9,
    back_spin: 8109.3,
    side_spin: -124.2,
    vla: 24.3,
    descent_angle: 50.6,
    peak_height: 32.5,
    club_speed: null
  },
  "gap-wedge": {
    carry: 120.1,
    total_distance: 123.9,
    ball_speed: 95.2,
    back_spin: 9400.5,
    side_spin: 52.5,
    vla: 26.4,
    descent_angle: 51.1,
    peak_height: 30.1,
    club_speed: null
  },
  "sand-wedge": {
    carry: 104.4,
    total_distance: 106.5,
    ball_speed: 86.7,
    back_spin: 10831.9,
    side_spin: 134.0,
    vla: 28.4,
    descent_angle: 51.4,
    peak_height: 26.8,
    club_speed: null
  },
  "lob-wedge": {
    carry: 88.3,
    total_distance: 91.5,
    ball_speed: 77.1,
    back_spin: 10687.3,
    side_spin: -238.4,
    vla: 32.2,
    descent_angle: 51.8,
    peak_height: 23.9,
    club_speed: null
  }
} as const;

export type ClubAverages = typeof CLUB_AVERAGES;
export type ClubName = keyof ClubAverages; 