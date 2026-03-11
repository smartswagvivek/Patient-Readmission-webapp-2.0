import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Landing } from "../pages/Landing.jsx";

describe("Landing page", () => {
  it("shows get started action and hides prediction CTA", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("link", { name: /get started/i }).length).toBeGreaterThan(0);
    expect(screen.queryByText(/start prediction/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/start patient assessment/i)).not.toBeInTheDocument();
  });
});
