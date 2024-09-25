import debug, { Debugger } from "debug";

const APP_NAME = "waku";

export class Logger {
  private _debug: Debugger;
  private _info: Debugger;
  private _warn: Debugger;
  private _error: Debugger;

  private static createDebugNamespace(level: string, prefix?: string): string {
    return prefix ? `${APP_NAME}:${level}:${prefix}` : `${APP_NAME}:${level}`;
  }

  public constructor(prefix?: string) {
    this._debug = debug(Logger.createDebugNamespace("debug", prefix));
    this._info = debug(Logger.createDebugNamespace("info", prefix));
    this._warn = debug(Logger.createDebugNamespace("warn", prefix));
    this._error = debug(Logger.createDebugNamespace("error", prefix));
  }

  public get debug(): Debugger {
    return this._debug;
  }

  public get info(): Debugger {
    return this._info;
  }

  public get warn(): Debugger {
    return this._warn;
  }

  public get error(): Debugger {
    return this._error;
  }

  public log(
    level: "debug" | "info" | "warn" | "error",
    ...args: unknown[]
  ): void {
    const logger = this[level] as (...args: unknown[]) => void;
    logger(...args);
  }
}
