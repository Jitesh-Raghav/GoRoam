"use client";

import { useSession } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { Bell, Download, Palette, Save, Shield, Trash2, User } from "@/components/site/icons";
import { AvatarPicker } from "@/components/dashboard/avatar-picker";
import { SplitText } from "@/components/motion/split-text";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function Panel({ icon: Icon, title, description, children, tone = "default" }: { icon: typeof User; title: string; description: string; children: ReactNode; tone?: "default" | "danger" }) {
  return (
    <section className="grid grid-cols-1 gap-6 border-t border-line py-10 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-4">
        <span className={cn("grid size-11 place-items-center rounded-2xl", tone === "danger" ? "bg-destructive/10 text-destructive" : "bg-brand-soft text-brand")}>
          <Icon className="size-5" />
        </span>
        <h2 className="display mt-5 text-2xl text-ink">{title}</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone">{description}</p>
      </div>
      <div className="min-w-0 space-y-3 lg:col-span-8">{children}</div>
    </section>
  );
}

function Row({ title, description, action, tone = "default" }: { title: string; description: string; action: ReactNode; tone?: "default" | "danger" }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-5 ring-1 sm:flex-row sm:items-center sm:justify-between",
        tone === "danger" ? "bg-destructive/[0.04] ring-destructive/20" : "bg-white/80 ring-line"
      )}
    >
      <div>
        <h3 className={cn("font-medium", tone === "danger" ? "text-destructive" : "text-ink")}>{title}</h3>
        <p className="mt-1 text-sm text-stone">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl bg-white/80 px-4 text-ink outline-none ring-1 ring-line transition-shadow placeholder:text-stone-2 focus:bg-white focus:ring-2 focus:ring-brand/40";
const selectClass = cn(inputClass, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236e665c%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:14px] bg-[right_1rem_center] bg-no-repeat pr-10");
const ghostButton = "inline-flex h-10 items-center gap-2 rounded-full bg-paper-2 px-4 text-sm text-ink transition-colors hover:bg-ink hover:text-paper";

function SettingsContent() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    security: true,
  });

  return (
    <div className="mx-auto max-w-[68.75rem]">
      <header className="mb-10">
        <p className="eyebrow text-stone">Settings</p>
        <h1 className="display mt-4 text-[clamp(2.38rem,5.1vw,4.25rem)] leading-[0.92] text-ink">
          <SplitText text="Make it" trigger="mount" className="inline" />{" "}
          <SplitText segments={[{ text: "yours.", className: "accent" }]} trigger="mount" delay={0.1} className="inline" />
        </h1>
        <p className="mt-4 max-w-xl text-lg text-stone">Manage your account preferences and settings.</p>
      </header>

      <Panel icon={User} title="Profile" description="Update your personal information and profile details.">
        <AvatarPicker />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="eyebrow mb-2 block text-[0.62rem] text-stone">Full name</span>
            <input id="name" defaultValue={session?.user?.name || ""} placeholder="Enter your full name" className={inputClass} />
          </label>
          <label className="block">
            <span className="eyebrow mb-2 block text-[0.62rem] text-stone">Email address</span>
            <input id="email" type="email" defaultValue={session?.user?.email || ""} placeholder="Enter your email" className={inputClass} />
          </label>
        </div>
        <div className="flex justify-end pt-2">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm text-paper transition-colors hover:bg-brand">
            <Save className="size-4" /> Save changes
          </button>
        </div>
      </Panel>

      <Panel icon={Shield} title="Account & security" description="Manage your account security and privacy settings.">
        <Row
          title="Two-factor authentication"
          description="Add an extra layer of security to your account."
          action={<span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-medium text-brand">Not enabled</span>}
        />
        <Row title="Login activity" description="View recent login attempts and active sessions." action={<button type="button" className={ghostButton}>View activity</button>} />
        <Row title="Password" description="You sign in with Google, so there's no GoRoam password to manage." action={<span className="text-sm text-stone">Google account</span>} />
      </Panel>

      <Panel icon={Bell} title="Notifications" description="Choose how you want to be notified about updates and activities.">
        {[
          { key: "email", title: "Email notifications", description: "Receive notifications via email" },
          { key: "push", title: "Push notifications", description: "Receive push notifications in your browser" },
          { key: "marketing", title: "Marketing emails", description: "Receive updates about new features and promotions" },
          { key: "security", title: "Security alerts", description: "Get notified about important security events" },
        ].map((item) => (
          <Row
            key={item.key}
            title={item.title}
            description={item.description}
            action={
              <Switch
                aria-label={item.title}
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, [item.key]: checked }))}
              />
            }
          />
        ))}
      </Panel>

      <Panel icon={Palette} title="Preferences" description="Customize your experience and default settings.">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="eyebrow mb-2 block text-[0.62rem] text-stone">Default currency</span>
            <select id="currency" className={selectClass}>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD ($)</option>
            </select>
          </label>
          <label className="block">
            <span className="eyebrow mb-2 block text-[0.62rem] text-stone">Timezone</span>
            <select id="timezone" className={selectClass}>
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">Greenwich Mean Time</option>
            </select>
          </label>
          <label className="block">
            <span className="eyebrow mb-2 block text-[0.62rem] text-stone">Language</span>
            <select id="language" className={selectClass}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </label>
        </div>
      </Panel>

      <Panel icon={Download} title="Data & privacy" description="Manage your data and privacy settings.">
        <Row
          title="Export data"
          description="Download all your data including itineraries and preferences."
          action={
            <button type="button" className={ghostButton}>
              <Download className="size-4" /> Export
            </button>
          }
        />
        <Row
          tone="danger"
          title="Delete account"
          description="Permanently delete your account and all associated data."
          action={
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm text-destructive ring-1 ring-destructive/30 transition-colors hover:bg-destructive hover:text-white">
              <Trash2 className="size-4" /> Delete
            </button>
          }
        />
      </Panel>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
