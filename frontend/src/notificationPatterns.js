/**
 * Factory Method pattern: each concrete factory decides which notification
 * product to create. Products delegate display to a notification service.
 */
export class Notification {
  constructor(message, type) {
    this.message = message;
    this.type = type;
  }

  show(notificationService) {
    notificationService.notify(this.message, this.type);
  }
}

export class SuccessNotification extends Notification {
  constructor(message) {
    super(message, "success");
  }
}

export class ErrorNotification extends Notification {
  constructor(message) {
    super(message, "error");
  }
}

export class NotificationFactory {
  createNotification(_message) {
    throw new Error("createNotification() must be implemented by a concrete factory.");
  }
}

export class SuccessNotificationFactory extends NotificationFactory {
  createNotification(message) {
    return new SuccessNotification(message);
  }
}

export class ErrorNotificationFactory extends NotificationFactory {
  createNotification(message) {
    return new ErrorNotification(message);
  }
}

/**
 * Existing display mechanism used by the React UI. The callback is supplied
 * by App, so this module does not depend on React or a third-party toast lib.
 */
export class InlineNotificationService {
  constructor(onDisplay) {
    this.onDisplay = onDisplay;
  }

  showSuccess(message) {
    this.onDisplay({ type: "success", message });
  }

  showError(message) {
    this.onDisplay({ type: "error", message });
  }
}

/** Adapter pattern: exposes one notify(message, type) interface and translates
 * it into the display service's showSuccess/showError methods. */
export class NotificationServiceAdapter {
  constructor(displayService) {
    this.displayService = displayService;
  }

  notify(message, type) {
    if (type === "success") {
      this.displayService.showSuccess(message);
      return;
    }

    if (type === "error") {
      this.displayService.showError(message);
      return;
    }

    throw new Error(`Unsupported notification type: ${type}`);
  }
}

export function createNotificationFactories() {
  return {
    success: new SuccessNotificationFactory(),
    error: new ErrorNotificationFactory(),
  };
}
