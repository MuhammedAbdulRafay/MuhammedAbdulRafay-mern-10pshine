import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeContext";

function TestConsumer() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="is-dark">{isDark.toString()}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.getItem.mockReset();
    localStorage.setItem.mockReset();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  it("should default to light theme when localStorage has no stored theme", () => {
    localStorage.getItem.mockReturnValue(null);

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("is-dark").textContent).toBe("false");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(localStorage.setItem).toHaveBeenCalledWith("notes-theme", "light");
  });

  it("should initialize dark mode when localStorage has 'dark' stored", () => {
    localStorage.getItem.mockReturnValue("dark");

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("is-dark").textContent).toBe("true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.setItem).toHaveBeenCalledWith("notes-theme", "dark");
  });

  it("should toggle theme from light to dark", () => {
    localStorage.getItem.mockReturnValue("light");

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("is-dark").textContent).toBe("false");

    fireEvent.click(screen.getByText("Toggle"));

    expect(screen.getByTestId("is-dark").textContent).toBe("true");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.setItem).toHaveBeenCalledWith("notes-theme", "dark");
  });

  it("should throw error when useTheme is used outside ThemeProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const TestComponent = () => {
      useTheme();
      return null;
    };
    expect(() => render(<TestComponent />)).toThrow(
      "useTheme must be used within ThemeProvider"
    );
    spy.mockRestore();
  });
});
