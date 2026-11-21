export class CommandRegistry {
  #commands = new Map();
  register(name, description, execute) {
    if (this.#commands.has(name)) throw new Error(`Command already exists: ${name}`);
    this.#commands.set(name, { name, description, execute });
  }
  entries() { return Array.from(this.#commands.values()); }
  async execute(raw, context) {
    const [name, ...args] = raw.trim().split(/\s+/);
    const command = this.#commands.get(name.toLowerCase());
    if (!command) {
      await context.output.text(`command not found: ${name}\ntype 'help' for available commands.`, context.signal);
      return;
    }
    await command.execute({ args, ...context });
  }
}
