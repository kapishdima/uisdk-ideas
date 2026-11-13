"use client"

/**
 * Thin, styled wrappers over ui-sdk components — the start of a
 * shadcn-style registry. The behavior (and the agent bridge) comes from
 * ui-sdk; these files only add markup and classes.
 */

import { Button as SdkButton } from "@ui-sdk/react/button"
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  NumberInput,
  NumberInputControl,
  NumberInputGroup,
} from "@ui-sdk/react/number-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { Textarea } from "@ui-sdk/react/textarea"
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/cn"

export { cn }

type FieldShellProps = {
  label: string
  description?: ReactNode
  className?: string
  children: ReactNode
  /** Extra attributes for the field, like data-agent-secret. */
  fieldProps?: Record<string, string | boolean>
}

function FieldShell({ label, description, className, children, fieldProps }: FieldShellProps) {
  return (
    <Field className={className} {...fieldProps}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  )
}

export function TextField({
  label,
  description,
  className,
  fieldProps,
  ...props
}: Omit<FieldShellProps, "children"> & ComponentProps<typeof Input>) {
  return (
    <FieldShell label={label} description={description} className={className} fieldProps={fieldProps}>
      <Input {...props} />
    </FieldShell>
  )
}

export function TextareaField({
  label,
  description,
  className,
  ...props
}: Omit<FieldShellProps, "children"> & ComponentProps<typeof Textarea>) {
  return (
    <FieldShell label={label} description={description} className={className}>
      <Textarea {...props} />
    </FieldShell>
  )
}

export type Option = { value: string; label: string }

export function SelectField({
  label,
  description,
  className,
  items,
  placeholder,
  defaultValue,
  name,
}: Omit<FieldShellProps, "children"> & {
  items: Option[]
  placeholder?: string
  defaultValue?: string | null
  name?: string
}) {
  return (
    <FieldShell label={label} description={description} className={className}>
      <Select items={items} placeholder={placeholder} defaultValue={defaultValue} name={name}>
        <SelectTrigger>
          <SelectValue />
          <ChevronDownIcon aria-hidden="true" className="size-4 text-graphite" />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
              <SelectItemIndicator>
                <CheckIcon aria-hidden="true" className="size-4" />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}

export function DateField({
  label,
  description,
  className,
  defaultValue,
  name,
}: Omit<FieldShellProps, "children"> & { defaultValue?: string | null; name?: string }) {
  return (
    <FieldShell label={label} description={description} className={className}>
      <DatePicker defaultValue={defaultValue ?? null} name={name}>
        <div data-slot="date-picker-row">
          <DatePickerInput placeholder="mm/dd/yyyy" />
          <DatePickerTrigger aria-label={`Open calendar for ${label}`}>
            <CalendarIcon aria-hidden="true" className="size-4" />
          </DatePickerTrigger>
        </div>
        <DatePickerContent>
          <div data-slot="calendar-header">
            <CalendarPrevious>
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
            </CalendarPrevious>
            <CalendarHeading />
            <CalendarNext>
              <ChevronRightIcon aria-hidden="true" className="size-4" />
            </CalendarNext>
          </div>
          <CalendarGrid>
            <CalendarWeekdays>{(index) => <CalendarWeekday index={index} />}</CalendarWeekdays>
            <CalendarWeeks>{(cell) => <CalendarDay value={cell.date} />}</CalendarWeeks>
          </CalendarGrid>
        </DatePickerContent>
      </DatePicker>
    </FieldShell>
  )
}

export function NumberField({
  label,
  description,
  className,
  defaultValue,
  format,
  min,
  name,
  placeholder,
  step,
}: Omit<FieldShellProps, "children"> & {
  defaultValue?: number | null
  format?: Intl.NumberFormatOptions
  min?: number
  name?: string
  placeholder?: string
  /** Values snap to it, so money needs 0.01. */
  step?: number
}) {
  return (
    <FieldShell label={label} description={description} className={className}>
      <NumberInput defaultValue={defaultValue ?? null} format={format} min={min} step={step} name={name}>
        <NumberInputGroup>
          <NumberInputControl placeholder={placeholder} />
        </NumberInputGroup>
      </NumberInput>
    </FieldShell>
  )
}

export function SwitchField({
  label,
  description,
  className,
  defaultChecked,
  name,
}: Omit<FieldShellProps, "children"> & { defaultChecked?: boolean; name?: string }) {
  return (
    <Field
      className={cn(
        "!flex-row items-center justify-between gap-4 rounded-xl px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--hairline)]",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <FieldLabel>{label}</FieldLabel>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </div>
      <Switch defaultChecked={defaultChecked} name={name}>
        <SwitchThumb />
      </Switch>
    </Field>
  )
}

const buttonVariants = {
  primary:
    "bg-ink text-white shadow-[0_0_0_1px_#000,inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(10_13_20/0.2)] hover:bg-[#2b2b2b]",
  secondary: "bg-sheet text-ink shadow-control hover:bg-well",
  ghost: "text-graphite hover:bg-well hover:text-ink",
  danger: "bg-sheet text-danger shadow-[0_0_0_1px_rgb(217_45_32/0.3)] hover:bg-[#fef3f2]",
  signal:
    "bg-signal text-white shadow-[0_0_0_1px_#d7431a,inset_0_1px_0_rgb(255_255_255/0.2),0_1px_2px_rgb(240_78_31/0.3)] hover:bg-[#e2451a]",
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof SdkButton> & {
  variant?: keyof typeof buttonVariants
  size?: "sm" | "md" | "lg"
}) {
  return (
    <SdkButton
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-medium transition outline-none focus-visible:ring-4 focus-visible:ring-ink/10 data-disabled:pointer-events-none data-disabled:opacity-50",
        size === "lg" && "h-10 rounded-[10px] px-4 text-sm",
        size === "md" && "h-9 rounded-[10px] px-3.5 text-[13px]",
        size === "sm" && "h-8 rounded-[9px] px-3 text-[13px]",
        buttonVariants[variant],
        typeof className === "string" ? className : undefined,
      )}
    />
  )
}
