import json
import os

import boto3


def enqueue_ai_game_move(game_id: str) -> None:
    sqs_client = boto3.client("sqs")
    sqs_client.send_message(
        QueueUrl=os.environ["AI_GAME_MOVE_QUEUE_URL"],
        MessageBody=json.dumps({"gameId": game_id}),
    )
