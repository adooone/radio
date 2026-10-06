# Mojo UI - Component Usage Guide

Practical examples and patterns for using Mojo UI components.

---

## Table of Contents

1. [Form Components](#form-components)
2. [Layout Components](#layout-components)
3. [Navigation Components](#navigation-components)
4. [Feedback Components](#feedback-components)
5. [Advanced Patterns](#advanced-patterns)

---

## Form Components

### Input

**Basic Usage:**
```tsx
import { Input } from '@radio/mojo-ui';

function Form() {
  const [value, setValue] = useState('');
  
  return (
    <Input
      label="Username"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Enter username"
    />
  );
}
```

**With Error State:**
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  placeholder="user@example.com"
/>
```

**With Right Element (Password Toggle):**
```tsx
const [showPassword, setShowPassword] = useState(false);

<Input
  label="Password"
  type={showPassword ? 'text' : 'password'}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  rightElement={
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? '👁️' : '👁️‍🗨️'}
    </button>
  }
/>
```

### Select

**Basic Usage:**
```tsx
import { Select } from '@radio/mojo-ui';

const options = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Administrator' },
];

<Select
  label="Role"
  value={role}
  onChange={(e) => setRole(e.target.value)}
  options={options}
/>
```

### Textarea

**Basic Usage:**
```tsx
import { Textarea } from '@radio/mojo-ui';

<Textarea
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  placeholder="Enter description..."
/>
```

### Checkbox

**Basic Usage:**
```tsx
import { Checkbox } from '@radio/mojo-ui';

<Checkbox
  label="Make this public"
  checked={isPublic}
  onChange={(e) => setIsPublic(e.target.checked)}
/>
```

### Switch

**Basic Usage:**
```tsx
import { Switch } from '@radio/mojo-ui';

<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  label={isEnabled ? 'ON' : 'OFF'}
/>
```

---

## Layout Components

### Card

**Basic Card:**
```tsx
import { Card } from '@radio/mojo-ui';

<Card title="Album Statistics">
  <p>Total albums: 150</p>
  <p>Public: 120</p>
</Card>
```

**Card with Actions:**
```tsx
<Card 
  title="Recent Activity"
  footer={
    <Button variant="green" title="View All" />
  }
>
  <p>5 new uploads today</p>
</Card>
```

### Panel

**Basic Panel:**
```tsx
import { Panel } from '@radio/mojo-ui';

<Panel
  header={<h3>Settings</h3>}
  content={
    <div>
      <p>Panel content goes here</p>
    </div>
  }
/>
```

**Plain Variant:**
```tsx
<Panel
  variant="plain"
  content={<div>Simple content without decorations</div>}
/>
```

### PageLayout

**Page with Stats:**
```tsx
import { PageLayout, StatsGrid } from '@radio/mojo-ui';

const stats = [
  { label: 'Total Users', value: '1,234', change: '+12%' },
  { label: 'Active Now', value: '89', change: '+5%' },
  { label: 'Collections', value: '45', change: '+3%' },
];

<PageLayout
  title="Dashboard"
  subtitle="Overview of your radio station"
  stats={<StatsGrid stats={stats} />}
>
  <div>Main content here</div>
</PageLayout>
```

---

## Navigation Components

### NavigationIsland

**With React Router:**
```tsx
import { Link, useLocation } from '@tanstack/react-router';
import { NavigationIsland } from '@radio/mojo-ui';

function App() {
  const { pathname } = useLocation();
  
  const items = [
    { path: '/', label: 'Home' },
    { path: '/collection', label: 'Collection' },
    { path: '/users', label: 'Users' },
    { path: '/settings', label: 'Settings' },
  ];
  
  return (
    <NavigationIsland
      items={items}
      currentPath={pathname}
      logo={<Logo />}
      actions={<UserMenu />}
      linkComponent={Link}
    />
  );
}
```

**With Icons:**
```tsx
const items = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/collection', label: 'Collection', icon: <CollectionIcon /> },
];

<NavigationIsland items={items} currentPath="/" />
```

### Tabs

**Basic Tabs:**
```tsx
import { Tabs } from '@radio/mojo-ui';
import { useState } from 'react';

const tabs = [
  { id: 'albums', label: 'Albums' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'tracks', label: 'Tracks' },
];

const [activeTab, setActiveTab] = useState('albums');

<Tabs
  items={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### VinylTabs

**Vinyl-styled Tabs:**
```tsx
import { VinylTabs } from '@radio/mojo-ui';

const vinylTabs = [
  { id: 'now', label: 'Now Playing', icon: <PlayIcon /> },
  { id: 'queue', label: 'Queue', icon: <ListIcon /> },
  { id: 'history', label: 'History', icon: <ClockIcon /> },
];

<VinylTabs
  items={vinylTabs}
  activeTab="now"
  onTabChange={(tab) => console.log(tab)}
/>
```

---

## Feedback Components

### Modal

**Basic Modal:**
```tsx
import { Modal } from '@radio/mojo-ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<>
  <Button onClick={() => setIsOpen(true)} title="Open Modal" />
  
  <Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Confirm Action"
  >
    <p>Are you sure you want to proceed?</p>
    <div className="flex gap-2 mt-4">
      <Button variant="gray" onClick={() => setIsOpen(false)} title="Cancel" />
      <Button variant="green" onClick={handleConfirm} title="Confirm" />
    </div>
  </Modal>
</>
```

### Popup

**Dropdown Menu:**
```tsx
import { Popup, PopupItem } from '@radio/mojo-ui';

<Popup trigger={<Button title="Options" />}>
  <PopupItem onClick={handleEdit}>Edit</PopupItem>
  <PopupItem onClick={handleDuplicate}>Duplicate</PopupItem>
  <PopupItem onClick={handleDelete} variant="danger">
    Delete
  </PopupItem>
</Popup>
```

### CircularProgress

**Progress Indicator:**
```tsx
import { CircularProgress } from '@radio/mojo-ui';

<CircularProgress
  percentage={75}
  size={120}
  color="#47f57d"
  showLabel
/>
```

**Small Indicator:**
```tsx
<CircularProgress
  percentage={45}
  size={48}
  strokeWidth={4}
  color="#ffbd30"
/>
```

### Skeleton

**Loading State:**
```tsx
import { Skeleton, SkeletonText } from '@radio/mojo-ui';

// Single skeleton
<Skeleton variant="rectangular" width="100%" height="200px" />

// Text lines
<SkeletonText lines={3} lastLineWidth="60%" />

// Card skeleton
<div className="space-y-4">
  <Skeleton variant="rectangular" width="100%" height="120px" />
  <Skeleton variant="text" width="60%" />
  <Skeleton variant="text" width="80%" />
</div>

// Avatar + text
<div className="flex items-center gap-4">
  <Skeleton variant="circular" width={48} height={48} />
  <div className="flex-1">
    <Skeleton variant="text" width="40%" />
    <Skeleton variant="text" width="60%" />
  </div>
</div>
```

### ProgressBar

**Basic Progress:**
```tsx
import { ProgressBar } from '@radio/mojo-ui';

<ProgressBar progress={75} max={100} />
```

**With Segments:**
```tsx
<ProgressBar
  progress={60}
  max={100}
  size="medium"
  variant="green"
/>
```

### StatusIndicator

**Status Lights:**
```tsx
import { StatusIndicator } from '@radio/mojo-ui';

<StatusIndicator status="online" label="Live" />
<StatusIndicator status="offline" label="Offline" />
<StatusIndicator status="warning" label="Warning" />
<StatusIndicator status="error" label="Error" />
```

---

## Advanced Patterns

### Form Layout

**Complete Form:**
```tsx
import { 
  Input, 
  Select, 
  Textarea, 
  Checkbox,
  Button,
  Card 
} from '@radio/mojo-ui';

function UserForm() {
  return (
    <Card title="Create User">
      <form className="space-y-4">
        <Input
          label="Username *"
          required
          placeholder="Enter username"
        />
        
        <Input
          label="Email *"
          type="email"
          required
          placeholder="user@example.com"
        />
        
        <Select
          label="Role"
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Administrator' },
          ]}
        />
        
        <Textarea
          label="Bio"
          rows={3}
          placeholder="Tell us about yourself"
        />
        
        <Checkbox
          label="Send welcome email"
          defaultChecked
        />
        
        <div className="flex gap-2 pt-4">
          <Button variant="gray" title="Cancel" />
          <Button variant="green" title="Create User" />
        </div>
      </form>
    </Card>
  );
}
```

### Dashboard Layout

**Admin Dashboard:**
```tsx
import { 
  PageLayout, 
  StatsGrid, 
  Card,
  Button,
  CircularProgress 
} from '@radio/mojo-ui';

const stats = [
  { label: 'Total Albums', value: '156' },
  { label: 'Active Users', value: '42' },
  { label: 'Storage Used', value: '78%' },
];

<PageLayout
  title="Dashboard"
  stats={<StatsGrid stats={stats} />}
>
  <div className="grid grid-cols-2 gap-4">
    <Card title="Upload Progress">
      <CircularProgress percentage={75} color="#47f57d" />
    </Card>
    
    <Card title="Quick Actions">
      <div className="flex flex-col gap-2">
        <Button variant="green" title="Upload Album" />
        <Button variant="yellow" title="Sync Collection" />
      </div>
    </Card>
  </div>
</PageLayout>
```

### Loading States

**Page Loading:**
```tsx
import { Skeleton, SkeletonText } from '@radio/mojo-ui';

function LoadingPage() {
  return (
    <div className="space-y-6">
      <Skeleton variant="text" width="30%" height={32} />
      
      <div className="grid grid-cols-3 gap-4">
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={100} />
      </div>
      
      <Card>
        <SkeletonText lines={4} />
      </Card>
    </div>
  );
}
```

### Empty States

**No Data:**
```tsx
import { Card, Button } from '@radio/mojo-ui';

<Card title="Collections">
  {collections.length === 0 ? (
    <div className="text-center py-8">
      <p className="text-gray-400 mb-4">No collections yet</p>
      <Button variant="green" title="Create Collection" />
    </div>
  ) : (
    <CollectionList collections={collections} />
  )}
</Card>
```

---

## Styling Customizations

### Using Custom Styles

**With className:**
```tsx
<Card 
  title="Custom Card"
  className="border-amber-500"
>
  Content
</Card>
```

**Wrapper Approach:**
```tsx
<div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900">
  <Card title="Nested Card">
    Content
  </Card>
</div>
```

### Responsive Patterns

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card title="Item 1">...</Card>
  <Card title="Item 2">...</Card>
  <Card title="Item 3">...</Card>
</div>
```

---

## Common Pitfalls

### ❌ Don't

```tsx
// Don't mix Mojo UI with arbitrary Tailwind values
<Button className="bg-[#custom] p-[13px]" />

// Don't override component structure
<Card>
  <div className="override-card-styles">...</div>
</Card>
```

### ✅ Do

```tsx
// Use tokens or wrapper divs
<div className="custom-wrapper">
  <Button variant="green" title="Action" />
</div>

// Extend through composition
<Card 
  title="Card"
  className="additional-class"
>
  Content
</Card>
```

---

**Last Updated:** April 8, 2026
