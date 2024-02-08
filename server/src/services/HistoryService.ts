import { statSync } from "fs";
import { readFile } from "fs/promises";
import { glob } from "glob";
import { defaultsDeep } from "lodash";
import { _Connection } from "vscode-languageserver";
import { parseDocument } from "yaml";
import { BasicDayLog, BasicTask, defaultSettings, Settings, StructuredLog, Task, uriToPath } from "../../../shared/out";
import ConfigurationService from "./ConfigurationService";

interface DaylogFile {
  uri: string;
  content?: StructuredLog;
  incompleteTasks?: Task[];
  date: Date;
}

export default class HistoryService {
  private workspaceFolders: string[] = [];
  private daylogFiles: DaylogFile[] = [];

  private get configuration(): Settings {
    return this.configurationService.configuration;
  }

  public constructor(private connection: _Connection, private configurationService: ConfigurationService) {}

  public getIncompleteTasks(maxAge: number): { date: Date; task: Task }[] {
    const cutoff = new Date(Date.now() - maxAge);

    return this.daylogFiles.reduce<{ date: Date; task: Task }[]>((tasks, file) => {
      if (file.date < cutoff || !file.incompleteTasks) return tasks;
      return tasks.concat(file.incompleteTasks.map((task) => ({ task, date: file.date })));
    }, []);
  }

  public init(root?: string | null) {
    this.workspaceFolders = [];
    this.workspaceFolders = root ? [root] : [];

    if (this.workspaceFolders.length) this.updateFileList(this.workspaceFolders);
    else {
      this.connection.workspace.getWorkspaceFolders().then((folders) => {
        folders?.forEach((folder) => {
          const path = uriToPath(folder.uri);
          if (statSync(path).isDirectory()) this.workspaceFolders.push(path);
        });
        this.updateFileList(this.workspaceFolders);
      });
    }

    this.connection.onDidSaveTextDocument(({ textDocument }) => {
      if (!textDocument.uri.match(/daylog\.yml$/)) return;
      this.updateFiles([uriToPath(textDocument.uri)]);
    });
    this.connection.onDidChangeConfiguration(() => {
      this.configurationService = defaultsDeep(
        this.connection.workspace.getConfiguration("daily-timelog"),
        defaultSettings
      );
    });
  }

  private async updateFileList(folders: string[]) {
    await Promise.all(
      folders.map(async (folder) => {
        console.log(`Searching for daylog files in ${folder}`);
        const files = await glob("**/*.daylog.yml", { cwd: folder });
        console.log(`Found ${files.length} daylog files: ${files.join(", ")}`);
        await this.updateFiles(files.map((file) => `${folder}/${file}`));
      })
    );
  }

  private async updateFiles(files: string[]) {
    await Promise.all(
      files.map(async (uri) => {
        if (!uri.match(/daylog\.yml$/)) return;

        const existing = this.daylogFiles.find((file) => file.uri === uri)
        const file: Partial<DaylogFile> = existing || { uri };
        file.content = parseDocument(await readFile(uri, "utf8")).toJS();
        file.date = new Date(file.content?.date ?? Date.now());

        if (!existing) this.daylogFiles.push(file as DaylogFile);
        this.processFile(file as DaylogFile); // asynchronous
      })
    );
  }

  private async processFile(file: DaylogFile) {
    if (!file.content) return;

    try {
      const dayLog = BasicDayLog.fromStructuredLog(file.content, this.configuration.customTaskParams, true);
      file.incompleteTasks = dayLog.getTasks().filter((task) => task.name && !task.completed);
      delete file.content;
    } catch (error) {
      console.error(file.uri, error);
    }
  }
}
