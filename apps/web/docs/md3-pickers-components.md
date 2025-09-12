# Material Design 3 Date Pickers & Time Pickers

Uma implementação completa dos componentes Date Picker e Time Picker seguindo as especificações do Material Design 3, oferecendo múltiplas variantes e modos de entrada para seleção de datas e horários.

## Visão Geral

Os componentes de Picker implementam as especificações completas do MD3 para seleção de datas e horários:

### Date Pickers

- **Docked Date Picker**: Interface compacta com popover para seleção de datas
- **Modal Date Picker**: Interface modal para seleção de datas com mais espaço
- **Date Input**: Campo de entrada de data com validação

### Time Pickers

- **Time Picker Dial**: Interface de relógio analógico para seleção de horário
- **Time Picker Input**: Interface de entrada numérica para horário
- **Formato 12/24 horas**: Suporte completo para ambos os formatos

## Componentes Disponíveis

### Date Picker Components

```typescript
DatePicker; // Container principal do date picker
DatePickerTrigger; // Trigger para docked date picker
DatePickerContent; // Conteúdo do popover (docked)
ModalDatePickerTrigger; // Trigger para modal date picker
ModalDatePickerContent; // Conteúdo do modal
DatePickerInput; // Campo de entrada de data
```

### Time Picker Components

```typescript
TimePicker; // Container principal do time picker
TimePickerTrigger; // Trigger para time picker
TimePickerDial; // Interface de relógio analógico
TimePickerInputMode; // Interface de entrada numérica
TimePickerInput; // Campo de entrada de tempo
```

## Especificações Material Design 3

### Date Picker Specifications

#### Docked Date Picker

- **Container**: 360dp width × 456dp height
- **Elevation**: Level 3 (8dp)
- **Shape**: Large corner radius (16dp)
- **Date containers**: 48dp × 48dp with full corner radius
- **Today indicator**: 1dp outline in primary color
- **Selected date**: Primary container background

#### Modal Date Picker

- **Container**: 328dp width × 512dp height
- **Calendar grid**: 40dp × 40dp date cells
- **Header height**: 120dp
- **Action buttons**: 72dp × 36dp
- **Range selection**: Primary container for selected range

#### Date Input Modal

- **Container**: 328dp width × variable height
- **Text fields**: Outlined variant with date validation
- **Header**: 120dp height with headline and supporting text

### Time Picker Specifications

#### Time Picker Dial

- **Clock dial**: 256dp diameter
- **Selector handle**: 48dp diameter
- **Center dot**: 8dp diameter
- **Track width**: 2dp
- **Time selectors**: 96dp width × 80dp height
- **24h selectors**: 114dp width (vertical)
- **Period selectors**: 52dp × 80dp (vertical), 216dp × 38dp (horizontal)

#### Time Picker Input

- **Time fields**: 96dp width × 72dp height
- **Period selector**: 52dp width × 72dp height
- **Input validation**: Hours (00-23/01-12) and minutes (00-59)

## Uso Básico

### Docked Date Picker

```tsx
import { DatePicker, DatePickerTrigger, DatePickerContent } from "@/components/md3/pickers";

<DatePicker variant="docked" onValueChange={(date) => console.log(date)}>
  <DatePickerTrigger placeholder="Select date" />
  <DatePickerContent />
</DatePicker>
```

### Modal Date Picker

```tsx
import { DatePicker, ModalDatePickerTrigger, ModalDatePickerContent } from "@/components/md3/pickers";

<DatePicker variant="modal" onValueChange={(date) => console.log(date)}>
  <ModalDatePickerTrigger placeholder="Select date" />
  <ModalDatePickerContent title="Choose date" />
</DatePicker>
```

### Time Picker Dial

```tsx
import { TimePicker, TimePickerTrigger, TimePickerDial } from "@/components/md3/pickers";

<TimePicker variant="dial" format24={false} onValueChange={(time) => console.log(time)}>
  <TimePickerTrigger placeholder="Select time" />
  <TimePickerDial title="Select time" />
</TimePicker>
```

### Time Picker Input

```tsx
import { TimePicker, TimePickerTrigger, TimePickerInputMode } from "@/components/md3/pickers";

<TimePicker variant="input" format24={true} onValueChange={(time) => console.log(time)}>
  <TimePickerTrigger placeholder="Enter time" />
  <TimePickerInputMode title="Enter time" />
</TimePicker>
```

## Variantes e Opções

### Date Picker Props

```typescript
interface DatePickerProps {
    variant?: 'docked' | 'modal' | 'input'; // Tipo de date picker
    value?: Date; // Data selecionada
    onValueChange?: (date: Date | undefined) => void; // Callback de mudança
    disabled?: boolean; // Estado desabilitado
    children: React.ReactNode; // Conteúdo do picker
}
```

### Time Picker Props

```typescript
interface TimePickerProps {
    variant?: 'dial' | 'input'; // Tipo de time picker
    orientation?: 'vertical' | 'horizontal'; // Orientação do layout
    value?: string; // Tempo selecionado (HH:mm ou HH:mm AM/PM)
    onValueChange?: (time: string) => void; // Callback de mudança
    format24?: boolean; // Formato 24 horas (padrão: false)
    disabled?: boolean; // Estado desabilitado
    children: React.ReactNode; // Conteúdo do picker
}
```

### Input Field Props

```typescript
interface DatePickerInputProps {
    variant?: 'filled' | 'outlined'; // Estilo do campo
    placeholder?: string; // Texto placeholder
    disabled?: boolean; // Estado desabilitado
    value?: Date; // Valor do campo
}

interface TimePickerInputProps {
    variant?: 'filled' | 'outlined'; // Estilo do campo
    placeholder?: string; // Texto placeholder
    disabled?: boolean; // Estado desabilitado
    value?: string; // Valor do campo
}
```

## Exemplos Avançados

### Date Picker com Range Selection

```tsx
const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});

<DatePicker
  variant="modal"
  value={dateRange.start}
  onValueChange={(date) => setDateRange({...dateRange, start: date})}
>
  <ModalDatePickerTrigger placeholder="Start date" />
  <ModalDatePickerContent
    title="Select start date"
    description="Choose the beginning of your date range"
  />
</DatePicker>
```

### Time Picker 24h Format

```tsx
const [time24, setTime24] = useState("14:30");

<TimePicker
  variant="dial"
  format24={true}
  value={time24}
  onValueChange={setTime24}
>
  <TimePickerTrigger placeholder="24h format" />
  <TimePickerDial title="Select time (24h)" />
</TimePicker>
```

### Custom Styled Picker

```tsx
<DatePicker variant="docked" className="custom-date-picker">
  <DatePickerTrigger
    variant="filled"
    className="w-full"
    placeholder="Custom date picker"
  />
  <DatePickerContent
    showTodayButton={true}
    showClearButton={true}
    className="shadow-xl"
  />
</DatePicker>
```

## Estados Interativos

### Date Picker States

- **Enabled**: Estado padrão interativo
- **Hover**: Feedback visual no hover
- **Focused**: Indicador de foco com ring
- **Pressed**: Efeito ripple no toque/clique
- **Disabled**: Estado não-interativo com 38% opacity

### Time Picker States

- **Hour/Minute Selection**: Alternância entre seleção de hora e minuto
- **AM/PM Toggle**: Alternância de período (formato 12h)
- **Dial vs Input**: Troca entre interface analógica e numérica
- **24h Format**: Suporte completo para formato de 24 horas

## Cores e Temas

### Date Picker Colors

```css
/* Container */
--date-picker-container: var(--md-sys-color-surface-container-high);
--date-picker-elevation: var(--md-sys-elevation-level3);

/* Selected date */
--date-selected-container: var(--md-sys-color-primary);
--date-selected-text: var(--md-sys-color-on-primary);

/* Today indicator */
--date-today-outline: var(--md-sys-color-primary);
--date-today-outline-width: 1dp;

/* Text */
--date-text: var(--md-sys-color-on-surface);
--date-text-secondary: var(--md-sys-color-on-surface-variant);
```

### Time Picker Colors

```css
/* Clock dial */
--time-dial-container: var(--md-sys-color-surface-container-highest);
--time-dial-track: var(--md-sys-color-primary);
--time-dial-handle: var(--md-sys-color-primary);

/* Time selectors */
--time-selector-selected: var(--md-sys-color-primary-container);
--time-selector-selected-text: var(--md-sys-color-on-primary-container);

/* Period selector */
--time-period-selected: var(--md-sys-color-tertiary-container);
--time-period-selected-text: var(--md-sys-color-on-tertiary-container);
```

## Responsividade

### Breakpoints

- **Mobile Portrait**: Orientação vertical padrão
- **Mobile Landscape**: Time picker em orientação horizontal
- **Tablet/Desktop**: Modal date picker com tamanho fixo
- **Constrained Height**: Time picker input mode automático

### Adaptive Behavior

```tsx
// Responsive time picker
<TimePicker
  variant="dial"
  orientation={isLandscape ? "horizontal" : "vertical"}
  className={`${isMobile ? "time-picker-mobile" : "time-picker-desktop"}`}
>
  <TimePickerTrigger />
  <TimePickerDial />
</TimePicker>
```

## Acessibilidade

### Keyboard Navigation

- **Tab**: Navegação entre elementos focáveis
- **Enter/Space**: Ativação de botões e seleções
- **Arrow Keys**: Navegação no calendário e dial
- **Escape**: Fechar modais/popovers

### Screen Reader Support

```tsx
// Labels apropriados
<DatePickerTrigger aria-label="Select date" />
<TimePickerTrigger aria-label="Select time" />

// Descrições contextuais
<TimePickerDial
  aria-label="Time selection dial"
  aria-description="Use arrow keys to navigate hours and minutes"
/>
```

### WCAG Compliance

- **Color Contrast**: 4.5:1 para textos normais, 3:1 para textos grandes
- **Touch Targets**: 48dp mínimo para elementos tocáveis
- **Focus Indicators**: Ring visual claro em elementos focados
- **Error States**: Feedback visual e textual para validação

## Integração com Formulários

### React Hook Form

```tsx
import { useForm, Controller } from "react-hook-form";

const { control, handleSubmit } = useForm();

<Controller
  name="eventDate"
  control={control}
  render={({ field }) => (
    <DatePicker
      value={field.value}
      onValueChange={field.onChange}
    >
      <DatePickerTrigger placeholder="Event date" />
      <DatePickerContent />
    </DatePicker>
  )}
/>
```

### Validation

```tsx
const [dateError, setDateError] = useState("");

<DatePicker
  onValueChange={(date) => {
    if (!date) {
      setDateError("Date is required");
    } else if (date < new Date()) {
      setDateError("Date must be in the future");
    } else {
      setDateError("");
    }
  }}
>
  <DatePickerTrigger
    placeholder="Select date"
    className={dateError ? "border-error" : ""}
  />
  <DatePickerContent />
</DatePicker>
```

## Performance

### Lazy Loading

```tsx
const TimePickerDial = React.lazy(() => import("./TimePickerDial"));

<Suspense fallback={<TimePickerSkeleton />}>
  <TimePickerDial />
</Suspense>
```

### Memoization

```tsx
const MemoizedDatePicker = React.memo(DatePicker);
const MemoizedTimePicker = React.memo(TimePicker);
```

## Customização Avançada

### Custom Date Format

```tsx
const customFormatter = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

// Implementar formatter customizado no componente
```

### Custom Time Format

```tsx
const [time, setTime] = useState('14:30:45'); // Com segundos

// Implementar suporte a segundos/milissegundos
```

### Theming

```tsx
// CSS Variables para customização
:root {
  --date-picker-primary: #6750a4;
  --date-picker-surface: #fef7ff;
  --time-picker-accent: #7c4dff;
}
```

Esta implementação oferece uma solução completa e flexível para seleção de datas e horários, seguindo rigorosamente as especificações do Material Design 3 e fornecendo excelente experiência do usuário em todas as plataformas.
