import fs from "fs";

import debug from "debug";
import Docker from "dockerode";

import { Args } from "./interfaces.js";

const log = debug("waku:docker");

const NETWORK_NAME = "waku";
const SUBNET = "172.18.0.0/16";
const IP_RANGE = "172.18.0.0/24";
const GATEWAY = "172.18.0.1";

export default class Dockerode {
  public docker: Docker;
  private readonly IMAGE_NAME: string;
  public containerId?: string;

  private static network: Docker.Network;
  private containerIp: string;
  private uniqueLabel = `test-${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}`;

  private constructor(imageName: string, containerIp: string) {
    this.docker = new Docker();
    this.IMAGE_NAME = imageName;
    this.containerIp = containerIp;
  }

  public static async createInstance(imageName: string): Promise<Dockerode> {
    if (!Dockerode.network) {
      Dockerode.network = await Dockerode.createNetwork(NETWORK_NAME);
    }

    const instance = new Dockerode(imageName, Dockerode.getNextIp());
    return instance;
  }

  private static async createNetwork(
    networkName: string = NETWORK_NAME
  ): Promise<Docker.Network> {
    const docker = new Docker();
    const networks = await docker.listNetworks();
    const existingNetwork = networks.find(
      (network) => network.Name === networkName
    );

    let network: Docker.Network;

    if (existingNetwork) {
      network = docker.getNetwork(existingNetwork.Id);
    } else {
      network = await docker.createNetwork({
        Name: networkName,
        Driver: "bridge",
        IPAM: {
          Driver: "default",
          Config: [
            {
              Subnet: SUBNET,
              IPRange: IP_RANGE,
              Gateway: GATEWAY
            }
          ]
        }
      });
    }

    return network;
  }

  private static getNextIp(): string {
    const baseIpFragments = "172.18".split(".");
    // Generate a random number between 0 and 255 for the last two fragments.
    const secondLastFragment = Math.floor(Math.random() * 256); // For the .0 fragment
    const lastFragment = Math.floor(Math.random() * 256); // For the last fragment
    const newIp = [...baseIpFragments, secondLastFragment, lastFragment].join(
      "."
    );
    return newIp;
  }

  get container(): Docker.Container | undefined {
    if (!this.containerId) {
      return undefined;
    }
    return this.docker.getContainer(this.containerId);
  }

  async startContainer(
    ports: number[],
    args: Args,
    logPath: string,
    wakuServiceNodeParams?: string
  ): Promise<Docker.Container> {
    const [rpcPort, tcpPort, websocketPort, discv5UdpPort] = ports;

    await this.confirmImageExistsOrPull();

    const argsArray = argsToArray(args);
    if (wakuServiceNodeParams) {
      argsArray.push(wakuServiceNodeParams);
    }

    const argsArrayWithIP = [...argsArray, `--nat=extip:${this.containerIp}`];
    log(`Args: ${argsArray.join(" ")}`);

    const container = await this.docker.createContainer({
      Image: this.IMAGE_NAME,
      Labels: {
        "test-label": this.uniqueLabel
      },
      HostConfig: {
        AutoRemove: true,
        PortBindings: {
          [`${rpcPort}/tcp`]: [{ HostPort: rpcPort.toString() }],
          [`${tcpPort}/tcp`]: [{ HostPort: tcpPort.toString() }],
          [`${websocketPort}/tcp`]: [{ HostPort: websocketPort.toString() }],
          ...(args?.peerExchange && {
            [`${discv5UdpPort}/udp`]: [{ HostPort: discv5UdpPort.toString() }]
          })
        }
      },
      ExposedPorts: {
        [`${rpcPort}/tcp`]: {},
        [`${tcpPort}/tcp`]: {},
        [`${websocketPort}/tcp`]: {},
        ...(args?.peerExchange && {
          [`${discv5UdpPort}/udp`]: {}
        })
      },
      Cmd: argsArrayWithIP
    });
    await container.start();

    await Dockerode.network.connect({
      Container: container.id,
      EndpointConfig: {
        IPAMConfig: {
          IPv4Address: this.containerIp
        }
      }
    });
    const logStream = fs.createWriteStream(logPath);

    container.logs(
      { follow: true, stdout: true, stderr: true },
      (err, stream) => {
        if (err) {
          throw err;
        }
        if (stream) {
          stream.pipe(logStream);
        }
      }
    );

    this.containerId = container.id;
    log(`${this.containerId} started at ${new Date().toLocaleTimeString()}`);
    return container;
  }

  async stop(): Promise<void> {
    const containers = await this.docker.listContainers({
      all: true,
      filters: { label: [`test-label=${this.uniqueLabel}`] }
    });

    for (const containerInfo of containers) {
      const container = this.docker.getContainer(containerInfo.Id);

      try {
        await container.stop();
      } catch (err) {
        log(
          `Failed to stop container ${containerInfo.Id}, might be already stopped.`
        );
      }

      await container.remove();
      log(`Container ${containerInfo.Id} removed.`);
    }
  }

  private async confirmImageExistsOrPull(): Promise<void> {
    log(`Confirming that image ${this.IMAGE_NAME} exists`);

    const doesImageExist = this.docker.getImage(this.IMAGE_NAME);
    if (!doesImageExist) {
      await new Promise<void>((resolve, reject) => {
        this.docker.pull(this.IMAGE_NAME, {}, (err, stream) => {
          if (err) {
            reject(err);
          }
          this.docker.modem.followProgress(stream, (err, result) => {
            if (err) {
              reject(err);
            }
            if (result) {
              resolve();
            }
          });
        });
      });
    }
    log(`Image ${this.IMAGE_NAME} successfully found`);
  }
}

export function argsToArray(args: Args): Array<string> {
  const array = [];

  for (const [key, value] of Object.entries(args)) {
    // Change the key from camelCase to kebab-case
    const kebabKey = key.replace(/([A-Z])/g, (_, capital) => {
      return "-" + capital.toLowerCase();
    });

    const arg = `--${kebabKey}=${value}`;
    array.push(arg);
  }

  return array;
}
