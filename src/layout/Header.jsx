import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

function Header({ pageTitle, breadcrumbs = [] }) {
  const navigate = useNavigate();

  function refreshPage() {
    window.location.reload();
  }

  const defaultActions = [
    {
      id: "refresh",
      title: "Refresh",
      label: "↻",
      onClick: refreshPage,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center justify-between px-8 py-2">
        {/* LEFT */}
        <div className="pl-8">
          <h1 className="text-2xl font-bold text-foreground capitalize">
            {pageTitle}
          </h1>

          {breadcrumbs.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1">
                  {crumb.path ? (
                    <span
                      onClick={() => navigate(crumb.path)}
                      className="cursor-pointer font-medium text-primary hover:text-primary/80"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <span
                      className={
                        crumb.active
                          ? "text-muted-foreground"
                          : "cursor-pointer text-primary"
                      }
                    >
                      {crumb.label}
                    </span>
                  )}

                  {index < breadcrumbs.length - 1 && (
                    <span className="mx-1 text-muted-foreground">/</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2">
          {defaultActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              title={action.title}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:bg-muted hover:text-primary cursor-pointer"
            >
              {action.icon && <Icon name={action.icon} size="16px" />}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
