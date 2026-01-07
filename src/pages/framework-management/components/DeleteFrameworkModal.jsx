import Icon from "../../../components/Icon";

function DeleteFrameworkModal({ isOpen, onClose, onConfirm, framework }) {
  if (!isOpen || !framework) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Delete Framework
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="close" size="20px" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Warning Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="trash" size="32px" className="text-red-500" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Are you sure?
            </h3>
            <p className="text-muted-foreground">
              You are about to delete the framework:
            </p>
            <p className="font-semibold text-foreground">
              "{framework.frameworkName || framework.originalFileName}"
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>
          </div>

          {/* Framework Info */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Icon name="framework" size="16px" className="text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {framework.originalFileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {framework.frameworkType?.toUpperCase()} • {framework.fileSize}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Framework
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteFrameworkModal;