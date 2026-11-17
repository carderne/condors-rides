"use client";

import { cn } from "@/lib/utils";
import type { WrappedData } from "../data";
import { formatMinutes } from "../stats";
import { Big, CountUp, Delta, Face, Label, Rise, Slide } from "./primitives";

type Props = { data: WrappedData; index: number };

const EVEREST_M = 8849;

export function IntroSlide({ data, index }: Props) {
  return (
    <Slide tone="pink" kicker="Wrapped" index={index} className="justify-between">
      <Rise>
        <p className="text-2xl font-semibold">Hey {data.user.firstName}.</p>
        <p className="mt-1 text-2xl font-semibold opacity-70">Your year, by the numbers.</p>
      </Rise>
      {/* Race bib */}
      <Rise delay={200} className="relative -rotate-3">
        <div className="relative rounded-md bg-[#f3ede2] px-6 pt-8 pb-6 text-[#141414] shadow-[8px_8px_0_#141414]">
          {["top-2 left-2", "top-2 right-2", "bottom-2 left-2", "bottom-2 right-2"].map((pos) => (
            <span
              key={pos}
              className={cn(
                "absolute h-3 w-3 rounded-full bg-[#e1449b] ring-2 ring-[#141414]/30",
                pos,
              )}
            />
          ))}
          <p className="text-center font-mono text-xs tracking-[0.3em] uppercase">
            Condors Cycling Club
          </p>
          <p className="text-center text-[8rem] leading-none font-black tracking-[-0.08em] tabular-nums">
            2026
          </p>
          <p className="truncate text-center text-xl font-bold tracking-tight uppercase">
            {data.user.name}
          </p>
        </div>
      </Rise>
      <Rise delay={500}>
        <Label>Tap to continue →</Label>
      </Rise>
    </Slide>
  );
}

export function RidesSlide({ data, index }: Props) {
  return (
    <Slide tone="paper" kicker="Turnout" index={index} className="justify-center gap-8">
      <Rise>
        <Label>You showed up for</Label>
        <Big className="mt-2 text-[9rem] sm:text-[11rem]">
          <CountUp value={data.rides} />
        </Big>
        <p className="text-3xl font-bold tracking-tight">club rides</p>
      </Rise>
      <Rise delay={300} className="flex flex-wrap items-center gap-3">
        <Delta pct={data.prev.ridesChange} />
        {data.prev.rides > 0 && (
          <span className="font-mono text-xs uppercase opacity-60">{data.prev.rides} in 2025</span>
        )}
      </Rise>
      {data.ridesLed > 0 && (
        <Rise delay={500} className="border-t-2 border-current pt-4">
          <p className="text-xl">
            and you <b>led {data.ridesLed}</b> of them.
          </p>
        </Rise>
      )}
    </Slide>
  );
}

export function DistanceSlide({ data, index }: Props) {
  const everests = data.totalElevation / EVEREST_M;
  return (
    <Slide tone="ink" kicker="Distance" index={index} className="justify-between">
      <Rise>
        <Label>Kilometres ridden</Label>
        <Big className="mt-2 text-[#d9f24a]">
          <CountUp value={data.totalKm} />
        </Big>
        <div className="mt-4">
          <Delta pct={data.prev.kmChange} />
        </div>
      </Rise>
      <Rise delay={300}>
        <Label>Metres climbed</Label>
        <p className="mt-1 text-5xl font-bold tracking-tighter tabular-nums">
          <CountUp value={data.totalElevation} />
        </p>
        {everests >= 0.1 && (
          <div className="mt-4">
            <div className="flex items-end gap-1">
              {Array.from({ length: Math.min(10, Math.ceil(everests)) }, (_, i) => {
                const fill = Math.min(1, everests - i);
                return (
                  <svg key={i} viewBox="0 0 40 32" className="h-8 w-10">
                    <path
                      d="M0 32 L20 2 L40 32 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <clipPath id={`m${i}`}>
                      <rect x="0" y={32 - 30 * fill} width="40" height="32" />
                    </clipPath>
                    <path d="M0 32 L20 2 L40 32 Z" fill="#e1449b" clipPath={`url(#m${i})`} />
                  </svg>
                );
              })}
            </div>
            <p className="mt-2 text-lg">
              That&apos;s <b>{everests.toFixed(1)}×</b> Everest.
            </p>
          </div>
        )}
      </Rise>
      <Rise delay={500} className="border-t-2 border-current/40 pt-4">
        <p className="text-lg opacity-80">
          Average ride: <b>{data.avgKm} km</b>
        </p>
      </Rise>
    </Slide>
  );
}

export function CalendarSlide({ data, index }: Props) {
  const { weeks, streak, activeWeeks, favouriteDay, weekendShare } = data.calendar;
  const max = Math.max(1, ...weeks);
  return (
    <Slide tone="acid" kicker="Calendar" index={index} className="justify-between">
      <Rise>
        <Label>Longest streak</Label>
        <Big className="mt-2">
          <CountUp value={streak} />
        </Big>
        <p className="text-2xl font-bold tracking-tight">week{streak === 1 ? "" : "s"} in a row</p>
      </Rise>
      <Rise delay={250}>
        <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">
          {weeks.slice(0, 52).map((n, i) => (
            <div
              key={i}
              title={`Week ${i + 1}: ${n} ride${n === 1 ? "" : "s"}`}
              className="aspect-square rounded-[3px] border border-[#141414]/30"
              style={{
                backgroundColor: n ? `rgba(20,20,20,${0.25 + 0.75 * (n / max)})` : "transparent",
                animation: `wrapped-pop 400ms ease-out ${300 + i * 15}ms both`,
              }}
            />
          ))}
        </div>
        <p className="mt-2 font-mono text-xs uppercase opacity-70">
          {activeWeeks} of 52 weeks on the bike
        </p>
      </Rise>
      <Rise delay={600} className="grid grid-cols-2 gap-4 border-t-2 border-current pt-4">
        {favouriteDay && (
          <div>
            <Label>Go-to day</Label>
            <p className="text-2xl font-bold">{favouriteDay.name}</p>
          </div>
        )}
        <div>
          <Label>Weekends</Label>
          <p className="text-2xl font-bold">{Math.round(weekendShare * 100)}%</p>
        </div>
      </Rise>
    </Slide>
  );
}

export function ClockSlide({ data, index }: Props) {
  const clock = data.clock!;
  const pct = (clock.medianStart / (24 * 60)) * 100;
  return (
    <Slide tone="ink" kicker="Clock" index={index} className="justify-between">
      <Rise>
        <Label>You are a</Label>
        <p className="mt-3 text-6xl">{clock.type.emoji}</p>
        <p className="mt-2 text-5xl leading-none font-bold tracking-tighter">{clock.type.label}</p>
        <p className="mt-3 text-lg opacity-70">{clock.type.blurb}</p>
      </Rise>
      <Rise delay={300}>
        <Label>Typical roll-out</Label>
        <p className="text-6xl font-bold tracking-tighter text-[#e1449b] tabular-nums">
          {formatMinutes(clock.medianStart)}
        </p>
        <div className="relative mt-4 h-10">
          <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-current/40" />
          {[0, 6, 12, 18, 24].map((h) => (
            <span
              key={h}
              className="absolute top-full -translate-x-1/2 font-mono text-[10px] opacity-60"
              style={{ left: `${(h / 24) * 100}%` }}
            >
              {String(h).padStart(2, "0")}
            </span>
          ))}
          <div
            className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e1449b] ring-4 ring-[#e1449b]/30"
            style={{
              left: `${pct}%`,
              animation: "wrapped-slide 1200ms cubic-bezier(.2,.8,.2,1) both",
            }}
          />
        </div>
      </Rise>
      <Rise delay={600} className="mt-6 border-t-2 border-current/40 pt-4">
        <Label>Earliest start</Label>
        <p className="mt-1 text-lg">
          <b>{clock.earliest.time}</b> — {clock.earliest.name}, {clock.earliest.date}
        </p>
      </Rise>
    </Slide>
  );
}

export function PlannerSlide({ data, index }: Props) {
  const planner = data.planner!;
  const days = planner.medianHours / 24;
  return (
    <Slide tone="paper" kicker="Sign-ups" index={index} className="justify-center gap-8">
      <Rise>
        <Label>You usually hit “join”</Label>
        <Big className="mt-2">
          {days >= 1 ? (
            <CountUp value={days} decimals={1} />
          ) : (
            <CountUp value={planner.medianHours} />
          )}
        </Big>
        <p className="text-2xl font-bold tracking-tight">
          {days >= 1 ? "days" : "hours"} before the ride
        </p>
      </Rise>
      <Rise delay={300} className="rounded-xl bg-[#141414] p-5 text-[#f3ede2]">
        <p className="text-3xl font-bold tracking-tight">{planner.type.label}</p>
        <p className="mt-1 opacity-70">{planner.type.blurb}</p>
      </Rise>
      {planner.lastMinute > 0 && (
        <Rise delay={500}>
          <p className="text-lg">
            <b>{planner.lastMinute}</b> times you joined with under 12 hours to go.
          </p>
        </Rise>
      )}
    </Slide>
  );
}

export function CrewSlide({ data, index }: Props) {
  const { peopleMet, top, favouriteLeader, comments } = data.crew;
  return (
    <Slide tone="pink" kicker="Crew" index={index} className="justify-between">
      <Rise>
        <Label>You rode alongside</Label>
        <Big className="mt-2">
          <CountUp value={peopleMet} />
        </Big>
        <p className="text-2xl font-bold tracking-tight">different Condors</p>
      </Rise>
      <div className="flex flex-col gap-2">
        <Label>Most miles together</Label>
        {top.map((b, i) => (
          <Rise
            key={b.name}
            delay={250 + i * 150}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 border-[#141414] p-3",
              i === 0 ? "bg-[#141414] text-[#f3ede2]" : "bg-[#f3ede2]",
            )}
          >
            <span className="w-6 font-mono text-sm font-bold">{i + 1}</span>
            <Face name={b.name} image={b.image} className="h-10 w-10 text-sm" />
            <span className="flex-1 truncate font-semibold">{b.name}</span>
            <span className="font-mono text-sm tabular-nums">×{b.count}</span>
          </Rise>
        ))}
      </div>
      <Rise delay={800} className="grid grid-cols-2 gap-4 border-t-2 border-current pt-4">
        {favouriteLeader && (
          <div className="min-w-0">
            <Label>Favourite leader</Label>
            <p className="truncate text-lg font-bold">{favouriteLeader.name}</p>
            <p className="font-mono text-xs opacity-70">{favouriteLeader.count} rides</p>
          </div>
        )}
        <div>
          <Label>Comments</Label>
          <p className="text-lg font-bold">{comments}</p>
          <p className="font-mono text-xs opacity-70">{comments > 10 ? "chatty!" : "posted"}</p>
        </div>
      </Rise>
    </Slide>
  );
}

export function PlacesSlide({ data, index }: Props) {
  const { cafe, start, distinctRoutes, route } = data.places;
  const rows = [
    cafe && { label: "Café of choice", value: cafe.name, sub: `${cafe.count} visits` },
    start && { label: "Usual start", value: start.name, sub: `${start.count} roll-outs` },
    route && { label: "Most-ridden route", value: route.name, sub: `${route.count} times` },
  ].filter((r) => !!r);
  return (
    <Slide tone="paper" kicker="Places" index={index} className="justify-between">
      <Rise>
        <Label>Different routes ridden</Label>
        <Big className="mt-2">
          <CountUp value={distinctRoutes} />
        </Big>
      </Rise>
      <div className="flex flex-col">
        {rows.map((r, i) => (
          <Rise key={r.label} delay={250 + i * 200} className="border-t-2 border-current py-4">
            <Label>{r.label}</Label>
            <p className="mt-1 line-clamp-2 text-3xl leading-tight font-bold tracking-tight">
              {r.value}
            </p>
            <p className="font-mono text-xs uppercase opacity-60">{r.sub}</p>
          </Rise>
        ))}
      </div>
    </Slide>
  );
}

export function BigDaysSlide({ data, index }: Props) {
  return (
    <Slide tone="acid" kicker="Big days" index={index} className="justify-center gap-6">
      {data.longest && (
        <Rise className="rounded-xl border-2 border-[#141414] bg-[#f3ede2] p-5 shadow-[6px_6px_0_#141414]">
          <Label>Longest ride</Label>
          <p className="text-6xl font-bold tracking-tighter tabular-nums">
            <CountUp value={data.longest.distance} />
            <span className="text-2xl"> km</span>
          </p>
          <p className="mt-1 truncate font-semibold">{data.longest.name}</p>
          <p className="font-mono text-xs uppercase opacity-60">{data.longest.date}</p>
        </Rise>
      )}
      {data.biggest && (
        <Rise
          delay={300}
          className="rotate-1 rounded-xl border-2 border-[#141414] bg-[#141414] p-5 text-[#f3ede2] shadow-[6px_6px_0_#e1449b]"
        >
          <Label>Biggest bunch</Label>
          <p className="text-6xl font-bold tracking-tighter tabular-nums">
            <CountUp value={data.biggest.size} />
            <span className="text-2xl"> riders</span>
          </p>
          <p className="mt-1 truncate font-semibold">{data.biggest.name}</p>
          <p className="font-mono text-xs uppercase opacity-60">{data.biggest.date}</p>
        </Rise>
      )}
    </Slide>
  );
}

export function LeaderSlide({ data, index }: Props) {
  return (
    <Slide tone="ink" kicker="Leader" index={index} className="justify-center gap-6">
      <Rise>
        <p className="text-6xl">🐑</p>
        <Label className="mt-4">You took the front</Label>
        <Big className="mt-2 text-[#e1449b]">
          <CountUp value={data.ridesLed} />
        </Big>
        <p className="text-2xl font-bold">times</p>
      </Rise>
      {data.ridersLed > 0 && (
        <Rise delay={300} className="border-t-2 border-current/40 pt-4">
          <p className="text-xl">
            and brought <b className="text-[#d9f24a]">{data.ridersLed} riders</b> along with you.
          </p>
          <p className="mt-2 opacity-60">Thank you. Seriously.</p>
        </Rise>
      )}
    </Slide>
  );
}

export function ClubSlide({ data, index }: Props) {
  const share = data.club.shareOfRides * 100;
  return (
    <Slide tone="pink" kicker="The club" index={index} className="justify-between">
      <Rise>
        <Label>Together, Condors rode</Label>
        <Big className="mt-2">
          <CountUp value={data.club.km} />
        </Big>
        <p className="text-2xl font-bold">km on {data.club.rides} rides</p>
        <p className="mt-1 text-lg opacity-80">with {data.club.riders} riders.</p>
      </Rise>
      <Rise delay={300}>
        <Label>You were on</Label>
        <p className="text-5xl font-bold tracking-tighter">
          {share >= 1 ? Math.round(share) : share.toFixed(1)}%
        </p>
        <p className="text-lg">of all club rides</p>
        <div className="mt-3 h-4 overflow-hidden rounded-full border-2 border-[#141414]">
          <div
            className="h-full bg-[#141414]"
            style={{
              width: `${Math.max(1, share)}%`,
              animation: "wrapped-grow 1200ms cubic-bezier(.2,.8,.2,1) 400ms both",
            }}
          />
        </div>
      </Rise>
      <Rise delay={600} className="border-t-2 border-current pt-4">
        <p className="text-xl">
          Ride count rank: <b>#{data.rank.position}</b> of {data.rank.total}
          {data.rank.topPercent <= 25 && <> — top {data.rank.topPercent}%</>}
        </p>
      </Rise>
    </Slide>
  );
}

export function SummarySlide({ data, index }: Props) {
  const stats = [
    { label: "Rides", value: data.rides },
    { label: "Km", value: data.totalKm.toLocaleString("en-GB") },
    { label: "Climbed", value: `${(data.totalElevation / 1000).toFixed(1)}k m` },
    { label: "Riders met", value: data.crew.peopleMet },
    { label: "Week streak", value: data.calendar.streak },
    { label: "Rank", value: `#${data.rank.position}` },
  ];
  return (
    <Slide tone="paper" kicker="Summary" index={index} className="justify-between gap-4">
      <Rise className="flex items-center gap-4">
        <Face name={data.user.name} image={data.user.image} className="h-16 w-16 text-xl" />
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-tight">{data.user.name}</p>
          <Label>Wrapped 2026</Label>
        </div>
      </Rise>
      <Rise delay={200} className="rounded-xl bg-[#141414] p-5 text-[#f3ede2]">
        <Label>Your archetype</Label>
        <p className="mt-1 text-4xl leading-tight font-bold tracking-tight">
          {data.archetype.emoji} {data.archetype.title}
        </p>
      </Rise>
      <Rise delay={400} className="grid grid-cols-2 border-t-2 border-l-2 border-current">
        {stats.map((s) => (
          <div key={s.label} className="border-r-2 border-b-2 border-current p-3">
            <Label>{s.label}</Label>
            <p className="text-3xl font-bold tracking-tighter tabular-nums">{s.value}</p>
          </div>
        ))}
      </Rise>
      <Rise delay={600}>
        <p className="font-mono text-xs uppercase opacity-60">Screenshot it. See you in 2027 🦅</p>
      </Rise>
    </Slide>
  );
}

export function EmptySlide({ data, index }: Props) {
  return (
    <Slide tone="ink" kicker="Hmm" index={index} className="justify-center gap-6">
      <p className="text-7xl">👻</p>
      <p className="text-4xl font-bold tracking-tight">
        No club rides for you in 2026, {data.user.firstName}.
      </p>
      <p className="text-lg opacity-70">
        Still {data.club.rides} rides and {data.club.km.toLocaleString("en-GB")} km from the club,
        though. Come along in 2027!
      </p>
    </Slide>
  );
}
