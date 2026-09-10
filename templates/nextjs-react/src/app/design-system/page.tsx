'use client';

import { Bell, Search, Settings, LogOut, Inbox } from 'lucide-react';
import { Header } from '@/shared/components/header';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Switch } from '@/shared/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ThemeToggle } from '@/shared/components/theme-toggle';

const NAV_SECTIONS = [
  { id: 'buttons', label: 'Buttons' },
  { id: 'badges', label: 'Badges' },
  { id: 'form-controls', label: 'Form controls' },
  { id: 'overlays', label: 'Tooltip & Menu' },
  { id: 'dialog', label: 'Dialog' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'card', label: 'Card' },
  { id: 'table', label: 'Table' },
  { id: 'skeleton', label: 'Skeleton' },
  { id: 'empty-state', label: 'Empty state' },
] as const;

function Section({
  id,
  title,
  full,
  children,
}: {
  id: string;
  title: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card
      id={id}
      className={full ? 'scroll-mt-20 sm:col-span-2' : 'scroll-mt-20'}
    >
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        {children}
      </CardContent>
    </Card>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen">
      <Header title="Design System" actions={<ThemeToggle />} />

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="sticky top-20 hidden h-fit w-44 shrink-0 lg:block">
          <nav className="flex flex-col gap-1 text-sm">
            {NAV_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <p className="mb-8 max-w-2xl text-sm text-muted-foreground">
            A living reference of every UI primitive available in this template
            — Radix UI + Tailwind, built on the design tokens in{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              globals.css
            </code>
            .
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Section id="buttons" title="Buttons">
              <Button>Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Search">
                <Search className="h-4 w-4" />
              </Button>
              <Button disabled>Disabled</Button>
            </Section>

            <Section id="badges" title="Badges">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </Section>

            <Section id="form-controls" title="Form controls" full>
              <div className="grid w-full gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="ds-name">Name</Label>
                  <Input id="ds-name" placeholder="Ada Lovelace" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ds-search">Search</Label>
                  <Input
                    id="ds-search"
                    placeholder="Search…"
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="ds-invalid">Invalid</Label>
                  <Input
                    id="ds-invalid"
                    defaultValue="not-an-email"
                    aria-invalid="true"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Fruit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="cherry">Cherry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="ds-checkbox" defaultChecked />
                  <Label htmlFor="ds-checkbox">Accept terms</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="ds-switch" defaultChecked />
                  <Label htmlFor="ds-switch">Enable notifications</Label>
                </div>
                <RadioGroup
                  defaultValue="light"
                  className="grid gap-2 sm:col-span-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="light" id="ds-radio-light" />
                    <Label htmlFor="ds-radio-light">Light</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dark" id="ds-radio-dark" />
                    <Label htmlFor="ds-radio-dark">Dark</Label>
                  </div>
                </RadioGroup>
              </div>
            </Section>

            <Section id="overlays" title="Tooltip &amp; Dropdown menu">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>Helpful hint</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Bell className="mr-2 h-4 w-4" />
                    Open menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Section>

            <Section id="dialog" title="Dialog">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Section>

            <Section id="tabs" title="Tabs">
              <Tabs defaultValue="account" className="w-full">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  Account settings go here.
                </TabsContent>
                <TabsContent value="password">
                  Password settings go here.
                </TabsContent>
              </Tabs>
            </Section>

            <Section id="avatar" title="Avatar">
              <Avatar>
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
            </Section>

            <Card id="card" className="scroll-mt-20">
              <CardHeader>
                <CardTitle>Card</CardTitle>
                <CardDescription>
                  A card with a header, content, and footer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is the card body.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card id="table" className="scroll-mt-20">
              <CardHeader>
                <CardTitle>Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Ada Lovelace</TableCell>
                      <TableCell>
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow selected>
                      <TableCell>Grace Hopper</TableCell>
                      <TableCell>
                        <Badge variant="warning">Pending</Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Section id="skeleton" title="Skeleton">
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Section>

            <Card id="empty-state" className="scroll-mt-20">
              <EmptyState
                icon={<Inbox className="h-8 w-8" />}
                title="No messages"
                description="You're all caught up."
                action={{ label: 'Refresh', onClick: () => {} }}
              />
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
