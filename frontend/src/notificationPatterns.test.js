import { describe, expect, it, vi } from "vitest";
import {
  ErrorNotificationFactory,
  InlineNotificationService,
  NotificationServiceAdapter,
  SuccessNotificationFactory,
} from "./notificationPatterns";

describe("Factory Method notifications", () => {
  it("creates and displays a success notification", () => {
    const onDisplay = vi.fn();
    const adapter = new NotificationServiceAdapter(new InlineNotificationService(onDisplay));
    const notification = new SuccessNotificationFactory().createNotification("Subject saved");

    notification.show(adapter);

    expect(onDisplay).toHaveBeenCalledWith({ type: "success", message: "Subject saved" });
  });

  it("creates and displays an error notification", () => {
    const onDisplay = vi.fn();
    const adapter = new NotificationServiceAdapter(new InlineNotificationService(onDisplay));
    const notification = new ErrorNotificationFactory().createNotification("Request failed");

    notification.show(adapter);

    expect(onDisplay).toHaveBeenCalledWith({ type: "error", message: "Request failed" });
  });
});

describe("Adapter notification service", () => {
  it("translates success notifications to the display service API", () => {
    const displayService = { showSuccess: vi.fn(), showError: vi.fn() };
    new NotificationServiceAdapter(displayService).notify("Saved", "success");
    expect(displayService.showSuccess).toHaveBeenCalledWith("Saved");
    expect(displayService.showError).not.toHaveBeenCalled();
  });

  it("translates error notifications and rejects unknown types", () => {
    const displayService = { showSuccess: vi.fn(), showError: vi.fn() };
    const adapter = new NotificationServiceAdapter(displayService);
    adapter.notify("Failed", "error");
    expect(displayService.showError).toHaveBeenCalledWith("Failed");
    expect(() => adapter.notify("Hmm", "warning")).toThrow("Unsupported notification type: warning");
  });
});
