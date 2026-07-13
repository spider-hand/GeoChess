import json
import os

import boto3


def _enqueue(queue_url: str, payload: dict[str, str]) -> None:
    sqs_client = boto3.client("sqs")
    sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(payload),
    )


def enqueue_with_friends_game_start(game_id: str) -> None:
    _enqueue(os.environ["WITH_FRIENDS_GAME_START_QUEUE_URL"], {"gameId": game_id})


def enqueue_with_friends_game_timeout(game_id: str) -> None:
    _enqueue(os.environ["WITH_FRIENDS_GAME_TIMEOUT_QUEUE_URL"], {"gameId": game_id})
