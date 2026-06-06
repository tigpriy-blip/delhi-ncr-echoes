type Props = { name: string; age: number };

export function Header({ name, age }: Props) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-10 pb-8 relative">
      <div className="absolute top-2 right-6 text-5xl select-none balloon" aria-hidden>🎈</div>
      <div className="absolute top-6 right-20 text-4xl select-none balloon balloon-2" aria-hidden>🎈</div>
      <div className="absolute top-0 left-4 text-5xl select-none balloon balloon-3" aria-hidden>🎈</div>
      <div className="absolute bottom-0 right-40 text-3xl -rotate-12 select-none" aria-hidden>🎊</div>
      <div className="absolute top-16 left-24 text-2xl rotate-12 select-none" aria-hidden>✨</div>
      <div className="absolute bottom-4 left-10 text-2xl select-none" aria-hidden>🐹</div>

      <h1 className="scrap-head text-6xl md:text-7xl leading-none">
        <span className="text-4xl md:text-5xl mr-2" aria-hidden>🎂</span>
        <span className="party-banner">{name}</span>{" "}
        <span className="text-[var(--washi)]">is {age}!!!</span>
        <span className="text-4xl md:text-5xl ml-2" aria-hidden>🎉</span>
      </h1>
      <p className="scrap-head text-2xl mt-4 opacity-80">
        happy birthday {name} ♡ — a little scrapbook, just for you
      </p>
    </header>
  );
}
