# Material Design 3 Menu & Lists Components

Uma implementação completa dos componentes Menu e Lists seguindo as especificações do Material Design 3, oferecendo interações contextuais e organização de dados estruturada.

## Visão Geral

Esta implementação inclui dois componentes essenciais do Material Design 3:

### Menu

- **Dropdown Menu**: Menu contextual com items, separators, shortcuts
- **Submenu**: Menus aninhados com setas de navegação
- **Menu Items**: Checkbox, Radio, Labels com estados interativos
- **Keyboard Navigation**: Arrow keys, Enter/Space, Escape

### Lists

- **List Items**: One-line (56dp), Two-line (72dp), Three-line (88dp)
- **Leading Elements**: Avatar, Icon, Image/Thumbnail
- **Trailing Elements**: Text, Icons, Controls (Checkbox/Switch)
- **Interactive Lists**: Clickable, Selectable, Draggable items

## Especificações Material Design 3

### Menu Specifications

#### Menu Container

- **Min Width**: 128dp (8rem)
- **Max Width**: 280dp
- **Padding**: 8dp vertical
- **Corner Radius**: 12dp (large)
- **Background**: Surface container color
- **Border**: Outline variant, 1dp

#### Menu Items

- **Height**: 48dp minimum (touch target)
- **Padding**: 12dp horizontal, 12dp vertical
- **Gap**: 12dp between icon and text
- **Typography**: Body medium (14dp)

#### Interactive States

- **Hover**: On-surface 8% overlay
- **Focus**: On-surface 12% overlay
- **Pressed**: On-surface 12% overlay
- **Selected**: Secondary container background

### Lists Specifications

#### List Item Heights (MD3 Standard)

- **One-line**: 56dp height
- **Two-line**: 72dp height
- **Three-line**: 88dp height

#### List Item Padding

- **Horizontal**: 16dp left/right
- **Vertical**: Varies by line count
- **Leading Space**: 16dp from container
- **Trailing Space**: 16dp from container

#### Leading Elements

- **Small Icon**: 24dp × 24dp
- **Medium Avatar**: 40dp × 40dp
- **Large Thumbnail**: 56dp × 56dp

#### Density Variants

- **Default**: Standard MD3 heights
- **Compact**: -25% height reduction
- **Comfortable**: +25% height increase

## Uso Básico

### Menu Usage

#### Basic Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/md3";<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open Menu</Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent>
    <DropdownMenuItem>
      New File
    </DropdownMenuItem>
    <DropdownMenuItem>
      Open File
    </DropdownMenuItem>
    <DropdownMenuItem variant="destructive">
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Menu with Sections and Shortcuts

```tsx
import {
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuHeader
} from "@/components/md3";<DropdownMenuContent>
  <DropdownMenuHeader>
    File Operations
  </DropdownMenuHeader>

  <DropdownMenuItem>
    New File
    <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
  </DropdownMenuItem>

  <DropdownMenuItem>
    Open...
    <DropdownMenuShortcut>⌘O</DropdownMenuShortcut>
  </DropdownMenuItem>

  <DropdownMenuSeparator />

  <DropdownMenuLabel>Recent Files</DropdownMenuLabel>
  <DropdownMenuItem>Document 1.pdf</DropdownMenuItem>
  <DropdownMenuItem>Presentation.pptx</DropdownMenuItem>
</DropdownMenuContent>
```

#### Menu with Checkboxes and Radio Items

```tsx
import {
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/md3";const [showBookmarks, setShowBookmarks] = useState(true);
const [theme, setTheme] = useState("light");

<DropdownMenuContent>
  <DropdownMenuCheckboxItem
    checked={showBookmarks}
    onCheckedChange={setShowBookmarks}
  >
    Show Bookmarks
  </DropdownMenuCheckboxItem>

  <DropdownMenuSeparator />

  <DropdownMenuLabel>Theme</DropdownMenuLabel>
  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
    <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
    <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
  </DropdownMenuRadioGroup>
</DropdownMenuContent>
```

#### Submenu Navigation

```tsx
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/md3";<DropdownMenuContent>
  <DropdownMenuItem>Profile</DropdownMenuItem>
  <DropdownMenuItem>Settings</DropdownMenuItem>

  <DropdownMenuSub>
    <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
    <DropdownMenuSubContent>
      <DropdownMenuItem>Email</DropdownMenuItem>
      <DropdownMenuItem>Copy Link</DropdownMenuItem>
      <DropdownMenuItem>Social Media</DropdownMenuItem>
    </DropdownMenuSubContent>
  </DropdownMenuSub>

  <DropdownMenuSeparator />
  <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
</DropdownMenuContent>
```

### Lists Usage

#### Basic List with One-line Items

```tsx
import { List, ListItem, ListItemContent } from "@/components/md3";

<List>
  <ListItem clickable onClick={() => handleItemClick('item1')}>
    <ListItemContent headline="Inbox" />
  </ListItem>
  <ListItem clickable onClick={() => handleItemClick('item2')}>
    <ListItemContent headline="Drafts" />
  </ListItem>
  <ListItem clickable onClick={() => handleItemClick('item3')}>
    <ListItemContent headline="Sent" />
  </ListItem>
</List>
```

#### List with Avatars

```tsx
import { ListItemWithAvatar } from "@/components/md3";

const contacts = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    avatar: "/avatars/alice.jpg"
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    avatar: null,
    fallback: "BS"
  }
];

<List variant="outlined">
  {contacts.map(contact => (
    <ListItemWithAvatar
      key={contact.id}
      avatar={{
        src: contact.avatar,
        alt: contact.name,
        fallback: contact.fallback
      }}
      headline={contact.name}
      supportingText={contact.email}
      trailingText="2:30 PM"
      clickable
      onClick={() => selectContact(contact.id)}
    />
  ))}
</List>
```

#### List with Checkboxes

```tsx
import { ListItemWithCheckbox } from "@/components/md3";

const [selectedItems, setSelectedItems] = useState<string[]>([]);

const toggleItem = (itemId: string, checked: boolean) => {
  if (checked) {
    setSelectedItems(prev => [...prev, itemId]);
  } else {
    setSelectedItems(prev => prev.filter(id => id !== itemId));
  }
};

<List>
  {tasks.map(task => (
    <ListItemWithCheckbox
      key={task.id}
      headline={task.title}
      supportingText={task.description}
      checked={selectedItems.includes(task.id)}
      onCheckedChange={(checked) => toggleItem(task.id, checked)}
      checkboxPosition="leading"
    />
  ))}
</List>
```

#### List with Settings and Switches

```tsx
import { ListItemWithSwitch, ListSubheader } from "@/components/md3";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi, faBluetooth, faLocationDot } from "@fortawesome/free-solid-svg-icons";

const [settings, setSettings] = useState({
  wifi: true,
  bluetooth: false,
  location: true
});

<List variant="outlined">
  <ListSubheader>Network & Internet</ListSubheader>

  <ListItemWithSwitch
    icon={<FontAwesomeIcon icon={faWifi} />}
    headline="Wi-Fi"
    supportingText="Connected to Home Network"
    checked={settings.wifi}
    onCheckedChange={(checked) =>
      setSettings(prev => ({ ...prev, wifi: checked }))
    }
  />

  <ListItemWithSwitch
    icon={<FontAwesomeIcon icon={faBluetooth} />}
    headline="Bluetooth"
    supportingText="No devices connected"
    checked={settings.bluetooth}
    onCheckedChange={(checked) =>
      setSettings(prev => ({ ...prev, bluetooth: checked }))
    }
  />

  <ListSubheader>Privacy & Security</ListSubheader>

  <ListItemWithSwitch
    icon={<FontAwesomeIcon icon={faLocationDot} />}
    headline="Location Services"
    supportingText="Allow apps to access your location"
    checked={settings.location}
    onCheckedChange={(checked) =>
      setSettings(prev => ({ ...prev, location: checked }))
    }
  />
</List>
```

#### List with Images/Thumbnails

```tsx
import { ListItemWithImage } from "@/components/md3";

const articles = [
  {
    id: 1,
    title: "Getting Started with Material Design 3",
    summary: "Learn the fundamentals of Google's latest design system",
    image: "/articles/md3-guide.jpg",
    publishedAt: "2 hours ago"
  }
];

<List>
  {articles.map(article => (
    <ListItemWithImage
      key={article.id}
      image={{
        src: article.image,
        alt: article.title,
        aspectRatio: "16:9"
      }}
      headline={article.title}
      supportingText={article.summary}
      trailingText={article.publishedAt}
      clickable
      onClick={() => openArticle(article.id)}
    />
  ))}
</List>
```

#### Draggable List for Reordering

```tsx
import { DraggableListItem } from "@/components/md3";

const [items, setItems] = useState(todoItems);
const [draggedItem, setDraggedItem] = useState<string | null>(null);

const handleDragStart = (itemId: string) => {
  setDraggedItem(itemId);
};

const handleDragEnd = () => {
  setDraggedItem(null);
};

const handleDrop = (targetId: string) => {
  if (!draggedItem || draggedItem === targetId) return;

  const newItems = [...items];
  const dragIndex = newItems.findIndex(item => item.id === draggedItem);
  const targetIndex = newItems.findIndex(item => item.id === targetId);

  const [draggedItemObj] = newItems.splice(dragIndex, 1);
  newItems.splice(targetIndex, 0, draggedItemObj);

  setItems(newItems);
};

<List>
  {items.map(item => (
    <DraggableListItem
      key={item.id}
      onDragStart={() => handleDragStart(item.id)}
      onDragEnd={handleDragEnd}
      onDrop={() => handleDrop(item.id)}
      className={draggedItem === item.id ? "opacity-50" : ""}
    >
      <ListItemContent
        headline={item.title}
        supportingText={item.description}
      />
    </DraggableListItem>
  ))}
</List>
```

## Variantes e Opções

### Menu Props

```typescript
interface DropdownMenuContentProps {
    size?: 'default' | 'sm' | 'lg'; // Menu size variants
    sideOffset?: number; // Distance from trigger (default: 8dp)
}

interface DropdownMenuItemProps {
    variant?: 'default' | 'destructive'; // Item styling
    selected?: boolean; // Selection state
    inset?: boolean; // Indent for alignment
}
```

### List Props

```typescript
interface ListProps {
    variant?: 'default' | 'outlined' | 'elevated'; // List container style
    density?: 'default' | 'compact' | 'comfortable'; // Item spacing
}

interface ListItemProps {
    size?: 'one-line' | 'two-line' | 'three-line'; // Item height (56dp/72dp/88dp)
    selected?: boolean; // Selection state
    clickable?: boolean; // Interactive behavior
    disabled?: boolean; // Disabled state
}
```

## Exemplos Avançados

### Context Menu with Dynamic Content

```tsx
const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, show: false, item: null });

const handleContextMenu = (e: React.MouseEvent, item: any) => {
  e.preventDefault();
  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    show: true,
    item
  });
};

<div className="relative">
  {/* List items with right-click */}
  <List>
    {items.map(item => (
      <ListItem
        key={item.id}
        onContextMenu={(e) => handleContextMenu(e, item)}
        clickable
      >
        <ListItemContent headline={item.name} />
      </ListItem>
    ))}
  </List>

  {/* Context menu */}
  {contextMenu.show && (
    <div
      className="fixed z-50"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => editItem(contextMenu.item)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => duplicateItem(contextMenu.item)}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => deleteItem(contextMenu.item)}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </div>
  )}
</div>
```

### Multi-level Navigation Menu

```tsx
const [activeSection, setActiveSection] = useState("dashboard");

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FontAwesomeIcon icon={faTachometerAlt} />
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: <FontAwesomeIcon icon={faChartLine} />,
    children: [
      { id: "reports", label: "Reports" },
      { id: "insights", label: "Insights" },
      { id: "metrics", label: "Metrics" }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    icon: <FontAwesomeIcon icon={faCog} />,
    children: [
      { id: "profile", label: "Profile" },
      { id: "account", label: "Account" },
      { id: "preferences", label: "Preferences" }
    ]
  }
];

<List variant="outlined" className="w-64">
  {navigationItems.map(item => (
    <React.Fragment key={item.id}>
      {!item.children ? (
        <ListItem
          clickable
          selected={activeSection === item.id}
          onClick={() => setActiveSection(item.id)}
        >
          <ListItemLeading size="small">
            <div className="text-on-surface-variant">{item.icon}</div>
          </ListItemLeading>
          <ListItemContent headline={item.label} />
        </ListItem>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ListItem clickable>
              <ListItemLeading size="small">
                <div className="text-on-surface-variant">{item.icon}</div>
              </ListItemLeading>
              <ListItemContent headline={item.label} />
              <ListItemTrailing>
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="w-4 h-4 text-on-surface-variant"
                />
              </ListItemTrailing>
            </ListItem>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" sideOffset={8}>
            {item.children.map(child => (
              <DropdownMenuItem
                key={child.id}
                selected={activeSection === child.id}
                onClick={() => setActiveSection(child.id)}
              >
                {child.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </React.Fragment>
  ))}
</List>
```

### Filterable and Sortable List

```tsx
const [filter, setFilter] = useState("");
const [sortBy, setSortBy] = useState<"name" | "date" | "size">("name");
const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

const filteredAndSortedItems = React.useMemo(() => {
  let filtered = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );

  return filtered.sort((a, b) => {
    const order = sortOrder === "asc" ? 1 : -1;
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name) * order;
      case "date":
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * order;
      case "size":
        return (a.size - b.size) * order;
      default:
        return 0;
    }
  });
}, [items, filter, sortBy, sortOrder]);

<div className="space-y-4">
  {/* Filter and Sort Controls */}
  <div className="flex gap-2">
    <SearchBar
      placeholder="Filter items..."
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="flex-1"
    />

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FontAwesomeIcon icon={faSort} className="mr-2" />
          Sort by {sortBy}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="size">Size</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem
          checked={sortOrder === "desc"}
          onCheckedChange={(checked) =>
            setSortOrder(checked ? "desc" : "asc")
          }
        >
          Descending
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  {/* Filtered List */}
  <List variant="outlined">
    {filteredAndSortedItems.length === 0 ? (
      <ListItem>
        <ListItemContent
          headline="No items found"
          supportingText="Try adjusting your filter or search terms"
        />
      </ListItem>
    ) : (
      filteredAndSortedItems.map(item => (
        <ListItemWithImage
          key={item.id}
          image={{
            src: item.thumbnail,
            alt: item.name,
            aspectRatio: "1:1"
          }}
          headline={item.name}
          supportingText={formatDate(item.date)}
          trailingText={formatFileSize(item.size)}
          clickable
          onClick={() => openItem(item)}
        />
      ))
    )}
  </List>
</div>
```

### Selection Mode with Bulk Actions

```tsx
const [selectionMode, setSelectionMode] = useState(false);
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

const toggleSelection = (itemId: string) => {
  const newSelection = new Set(selectedItems);
  if (newSelection.has(itemId)) {
    newSelection.delete(itemId);
  } else {
    newSelection.add(itemId);
  }
  setSelectedItems(newSelection);
};

const selectAll = () => {
  setSelectedItems(new Set(items.map(item => item.id)));
};

const clearSelection = () => {
  setSelectedItems(new Set());
  setSelectionMode(false);
};

const bulkDelete = () => {
  // Handle bulk deletion
  const remaining = items.filter(item => !selectedItems.has(item.id));
  setItems(remaining);
  clearSelection();
};

<div className="space-y-4">
  {/* Selection Header */}
  {selectionMode && (
    <div className="flex items-center justify-between p-4 bg-primary-container rounded-lg">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={clearSelection}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
        <span className="font-medium">
          {selectedItems.size} of {items.length} selected
        </span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="destructive" onClick={bulkDelete}>
          Delete Selected
        </Button>
      </div>
    </div>
  )}

  {/* Item List */}
  <List>
    {items.map(item => (
      <ListItemWithCheckbox
        key={item.id}
        headline={item.name}
        supportingText={item.description}
        checked={selectedItems.has(item.id)}
        onCheckedChange={() => {
          if (!selectionMode) setSelectionMode(true);
          toggleSelection(item.id);
        }}
        checkboxPosition={selectionMode ? "leading" : "trailing"}
        className={selectedItems.has(item.id) ? "bg-secondary-container" : ""}
      />
    ))}
  </List>
</div>
```

## Estados Interativos

### Visual States

- ✅ **Enabled**: Estado padrão interativo
- ✅ **Hover**: State layer overlay (8% opacity)
- ✅ **Focused**: Focus ring indicator ou background (12% opacity)
- ✅ **Pressed**: Ripple effect com state layer (12% opacity)
- ✅ **Disabled**: 38% opacity, não-interativo

### Menu States

- **Closed**: Menu não visível
- **Opening**: Fade in + scale animation (150ms)
- **Open**: Menu visível, keyboard navigation ativo
- **Closing**: Fade out + scale animation (100ms)

### List Item States

- **Default**: Estado padrão, não-interativo
- **Hover**: Background overlay quando clickable
- **Selected**: Background container color
- **Dragging**: Reduced opacity, visual feedback

## Cores e Temas

### Menu Colors

```css
/* Menu container */
--menu-container: var(--md-sys-color-surface-container);
--menu-border: var(--md-sys-color-outline-variant);

/* Menu items */
--menu-item-text: var(--md-sys-color-on-surface);
--menu-item-hover: var(--md-sys-color-on-surface-8);
--menu-item-focus: var(--md-sys-color-on-surface-12);
--menu-item-selected: var(--md-sys-color-secondary-container);

/* Destructive items */
--menu-item-destructive: var(--md-sys-color-error);
--menu-item-destructive-hover: var(--md-sys-color-error-8);
```

### List Colors

```css
/* List container */
--list-container: var(--md-sys-color-surface);
--list-divider: var(--md-sys-color-outline-variant);

/* List items */
--list-item-text: var(--md-sys-color-on-surface);
--list-item-supporting: var(--md-sys-color-on-surface-variant);
--list-item-hover: var(--md-sys-color-on-surface-8);
--list-item-selected: var(--md-sys-color-secondary-container);

/* Subheaders */
--list-subheader: var(--md-sys-color-on-surface-variant);
```

## Responsividade

### Breakpoint Adaptations

- **Mobile**: Touch-optimized targets, simplified layouts
- **Tablet**: Enhanced hover states, larger touch targets
- **Desktop**: Keyboard shortcuts, precise cursor interactions

### Touch Targets

- **Menu Items**: 48dp minimum height
- **List Items**: 56dp/72dp/88dp based on line count
- **Interactive Elements**: 44dp minimum tap area

## Acessibilidade

### Keyboard Navigation

- **Menu**: Arrow keys navigation, Enter/Space selection, Escape close
- **Submenu**: Right arrow open, Left arrow close
- **List**: Tab through items, Enter/Space activation
- **Selection**: Space for multi-select, Shift+arrows for range

### Screen Reader Support

- **Menu**: Role menu/menuitem, aria-expanded states
- **Submenu**: Role menu, aria-haspopup
- **List**: Role list/listitem, aria-selected states
- **Checkboxes**: Proper checkbox semantics with labels

### WCAG Compliance

- ✅ **AA Color Contrast**: 4.5:1 text, 3:1 UI elements
- ✅ **Touch Targets**: 44dp minimum size
- ✅ **Focus Indicators**: 2px visible focus rings
- ✅ **State Communication**: Visual + programmatic feedback

## Performance

### Optimizations

- **Menu**: Portal rendering, lazy content loading
- **Lists**: Virtual scrolling para listas grandes (>100 items)
- **Drag & Drop**: Throttled drag events, optimized re-renders
- **Selection**: Efficient Set operations para bulk selections

### Bundle Size

- **Tree Shaking**: Import apenas componentes necessários
- **Icon Optimization**: FontAwesome selective imports
- **Animation**: CSS-based transitions over JavaScript
- **Memory**: Proper cleanup de event listeners e portal content

Esta implementação oferece componentes de navegação e organização robustos e acessíveis, seguindo rigorosamente as especificações do Material Design 3 para criar interfaces bem estruturadas e intuitivas.
