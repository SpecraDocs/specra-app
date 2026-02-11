export function ProjectsSidebar() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Projects
        </span>
      </div>
      <div className="flex-1 overflow-auto px-2">
        <p className="px-2 text-xs text-muted-foreground">
          Sign in to view projects.
        </p>
      </div>
    </div>
  );
}
