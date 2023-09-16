import {
  CloudWatchLogsClient,
  CloudWatchLogsClientConfig,
  DescribeLogGroupsCommand,
  DescribeLogGroupsCommandInput,
  DescribeLogGroupsCommandOutput,
  FilterLogEventsCommand,
  FilterLogEventsCommandInput,
  FilteredLogEvent,
} from "@aws-sdk/client-cloudwatch-logs";

let client = new CloudWatchLogsClient(getCredentials());

export function resetClient() {
  client = new CloudWatchLogsClient(getCredentials());
}

function getCredentials(): CloudWatchLogsClientConfig {
  return {
    region: localStorage.getItem("region") || "us-east-1",
    credentials: {
      accessKeyId: localStorage.getItem("accessKey") || "",
      secretAccessKey: localStorage.getItem("secretKey") || "",
    }
  }
}

export async function listLogGroups(pLogGroupNamePrefix: string, pLimit: number) {
  const input: DescribeLogGroupsCommandInput = {
    limit: pLimit,
    //only add logGroupNamePrefix if it is not empty
    ...(pLogGroupNamePrefix && { logGroupNamePrefix: pLogGroupNamePrefix }),
  };
  const command = new DescribeLogGroupsCommand(input);
  try {
    const response: DescribeLogGroupsCommandOutput = await client.send(command);
    return response
  } catch (error) {
    console.error("Error listing log groups:", error);
    return null;
  }
}

let eventNextToken: string | undefined = undefined; // Store the nextToken for subsequent calls
let hasFetchedAllLogs: boolean = false;  // Variable to track if all logs have been fetched

export function resetEventNextToken() {
  eventNextToken = undefined;
  hasFetchedAllLogs = false;  // Reset this as well when resetting the token
}

export async function fetchLogEvents(logGroupName: string, startTime: number, endTime: number): Promise<FilteredLogEvent[]> {
  try {
    // If all logs have been fetched, return an empty array
    if (hasFetchedAllLogs) {
      return [];
    }

    const params: FilterLogEventsCommandInput = {
      logGroupName,
      startTime,
      endTime,
      limit: 50,
      nextToken: eventNextToken,
    };

    const response = await client.send(new FilterLogEventsCommand(params));

    // Update the nextToken for subsequent calls
    if (response.nextToken) {
      eventNextToken = response.nextToken;
    } else {
      eventNextToken = undefined;
      hasFetchedAllLogs = true;  // Set this to true when there's no more data to fetch
    }

    if (!response.events) return [];

    return response.events;

  } catch (error) {
    console.error("Error fetching log events:", error);
    throw error;
  }
}