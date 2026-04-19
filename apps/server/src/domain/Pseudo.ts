const PSEUDO_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export class InvalidPseudoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPseudoError";
  }
}

export function validatePseudo(pseudo: string): void {
  if (!PSEUDO_REGEX.test(pseudo)) {
    throw new InvalidPseudoError(
      "Pseudo must be 3–20 characters, alphanumeric or underscores",
    );
  }
}
