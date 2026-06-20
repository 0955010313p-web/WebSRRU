import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DesignExamples() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-4 text-2xl font-semibold text-[var(--srru-green)]">SRRU Design Examples</h1>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium">Buttons</h2>
        <div className="flex gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium">Card</h2>
        <Card>
          <h3 className="text-lg font-semibold">Activity card</h3>
          <p className="mt-2 text-sm text-[var(--srru-muted)]">Minimal card with call-to-action.</p>
          <div className="mt-4">
            <Button>View</Button>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-medium">Next steps</h2>
        <ul className="list-disc pl-5 text-sm text-[var(--srru-muted)]">
          <li>Implement components into pages (mobile-first)</li>
          <li>Add micro-interactions and Lottie where appropriate</li>
          <li>Integrate recommendations API and chatbot</li>
        </ul>
      </section>

      <div className="mt-6">
        <Link href="/" className="text-sm text-[var(--srru-purple)]">Back to home</Link>
      </div>
    </div>
  );
}
