import Icon from "@/components/Icon";

const FrameworkMiniCard = ({ name, description }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-full 
        bg-purple-100 dark:bg-purple-900/40
        flex items-center justify-center
        border border-purple-200 dark:border-purple-800"
      >
        <Icon
          name="shield"
          size="16px"
          className="text-purple-600 dark:text-purple-400"
        />
      </div>

      <div className="flex flex-col">
        <span className="font-medium text-foreground line-clamp-1">{name}</span>
        {description && (
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

export default FrameworkMiniCard;
