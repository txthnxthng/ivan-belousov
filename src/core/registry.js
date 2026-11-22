export class CommandRegistry {
  #commands = new Map();

  register(name, description, execute) {
    const key = name.trim().toLocaleLowerCase('ru-RU').replace(/\s+/g, ' ');
    if (this.#commands.has(key)) throw new Error(`Command already exists: ${key}`);
    this.#commands.set(key, { name: key, description, execute });
  }

  entries() { return [...this.#commands.values()]; }

  async execute(raw, context) {
    const normalized = raw.trim().toLocaleLowerCase('ru-RU').replace(/\s+/g, ' ');
    // Match the longest registered command: supports commands containing spaces.
    const match = [...this.#commands.values()]
      .sort((a, b) => b.name.length - a.name.length)
      .find(({ name }) => normalized === name || normalized.startsWith(`${name} `));
    if (!match) {
      await context.output.text(`Команда не найдена: ${raw.trim()}\nВведите «меню», чтобы посмотреть список команд.`, context.signal);
      return;
    }
    const rest = normalized.slice(match.name.length).trim();
    await match.execute({ args: rest ? rest.split(' ') : [], ...context });
  }
}
