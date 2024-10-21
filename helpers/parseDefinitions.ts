export function parseDefinitions(definitionsSection: string) {
    const definitionsMatch = definitionsSection.match(/# .+/g);
    if (definitionsMatch) {
      const parsedDefinitions = definitionsMatch.map((def: string) => {
        return def.replace(/^# /, '')
                  .replace(/\[\[/g, '')
                  .replace(/\]\]/g, '')
                  .replace(/\{\{.+?\}\}/g, '')
                  .trim();
    });
    return parsedDefinitions;
    }
}