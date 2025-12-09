export type WrappedData = {
  user: {
    name: string;
    image: string | null;
  };
  ridesJoined: number;
  ridesLed: number;
  totalKm: number;
  totalElevation: number;
  longestRide: {
    name: string;
    distance: number;
    date: string;
  } | null;
  biggestGroup: {
    name: string;
    date: string;
    memberCount: number;
  } | null;
  favouriteRoute: {
    name: string;
    url: string;
    count: number;
  } | null;
  favouriteCafe: {
    name: string;
    count: number;
  } | null;
  topRidingBuddies: Array<{
    name: string;
    image: string | null;
    count: number;
  }>;
  favouriteLeader: {
    name: string;
    image: string | null;
    count: number;
  } | null;
  surfaceBreakdown: {
    road: number;
    offroad: number;
    virtual: number;
  };
  monthlyActivity: Array<{
    month: string;
    rides: number;
  }>;
  mostActiveMonth: {
    month: string;
    rides: number;
  } | null;
  rank: {
    position: number;
    total: number;
    percentile: number;
  };
};
