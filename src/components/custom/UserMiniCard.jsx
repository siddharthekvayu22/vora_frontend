import Icon from "@/components/Icon";
import { formatDate } from "../../utils/dateFormatter";

const UserMiniCard = ({
  name,
  email,
  date,
  icon = "user",
  isSelf = false,
  isEmailVerified,
}) => {
  // SELF CREATED
  if (isSelf) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 flex items-center justify-center text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
          <Icon name="user-check" size="18px" />
        </div>
        <div>
          <span className="font-semibold text-foreground block whitespace-nowrap">
            Self Created
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            User Registration
          </span>
        </div>
      </div>
    );
  }

  // NORMAL USER
  return (
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary border border-primary/20">
        <Icon name={icon} size="16px" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground whitespace-nowrap block capitalize">
            {name}
          </span>

          {isEmailVerified !== undefined && (
            <span
              className={`w-2 h-2 rounded-full cursor-pointer ${
                isEmailVerified ? "bg-green-500" : "bg-yellow-500"
              }`}
              title={
                isEmailVerified
                  ? "Email verified"
                  : "Email verification pending"
              }
            />
          )}
        </div>

        {email && (
          <span className="text-xs text-muted-foreground whitespace-nowrap block">
            {email}
          </span>
        )}

        {date && (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {formatDate(date)}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserMiniCard;
