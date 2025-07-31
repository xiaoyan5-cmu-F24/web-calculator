export class DisplayController {
    private inputEl: HTMLInputElement;

    constructor(selector: string) {
        const el = document.getElementById(selector) as HTMLInputElement | null;
        if (!el) {
            throw new Error(`Display element '#${selector}' not found.`);
        }
        this.inputEl = el;
    }

    /** Get current display value */
    get value(): string {
        return this.inputEl.value;
    }

    /** Set display value */
    set value(newValue: string) {
        this.inputEl.value = newValue;
    }

    /** Clear the display */
    clear(): void {
        this.value = '';
    }

    /** Append text to the display */
    append(value: string): void {
        this.value += value;
    }

    /** Delete the last character from the display */
    deleteLast(): void {
        this.value = this.value.slice(0, -1);
    }
}