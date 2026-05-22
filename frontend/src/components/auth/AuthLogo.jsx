export function AuthLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}