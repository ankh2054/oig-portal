import asyncio
import re
from telethon import TelegramClient
from telethon.tl.functions.channels import GetFullChannelRequest
from telethon.tl.types import MessageActionPinMessage

api_id = '15825270'
api_hash = '373e14f8151cd52b23dc1fe21d117f05'
phone_number = '+447725277831'  # format: '+12345678900'
group_link = 'https://t.me/waxgov'  # Replace with the actual group link


async def main():
    messages_to_search = 200
    async with TelegramClient('anon', api_id, api_hash) as client:
        await client.start(phone=phone_number)

        # Join the group if not already a member
        try:
            group = await client.get_input_entity(group_link)
        except ValueError:
            print(f"Invalid group link provided: {group_link}")
            return

        pinned_messages = []
        limit = 100
        offset_id = 0

        while len(pinned_messages) < 4 and messages_to_search > 0:
            try:
                messages = await client.get_messages(group, limit=limit, offset_id=offset_id)
            except Exception:
                break

            if not messages:
                break

            for msg in messages:
                if msg.action and isinstance(msg.action, MessageActionPinMessage):
                    pinned_messages.append(msg.reply_to_msg_id)
                    if len(pinned_messages) >= 4:
                        break

            offset_id = messages[-1].id
            messages_to_search -= limit

        filtered_messages = []

        if pinned_messages:
            for i, msg_id in enumerate(pinned_messages, 1):
                message = await client.get_messages(group, ids=msg_id)
                if "Guild Update Submission Cutoff" in message.text:
                    filtered_messages.append(message)

        date_pattern = re.compile(
            r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s\w+\s\d{1,2}\w{2},\s\d{4},\s\d{2}:\d{2}:\d{2}\sUTC|"
            r"(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday),\s\w+\s\d{1,2}\w{2},\sfrom\s\d{2}:\d{2}:\d{2}\suntil\s\d{2}:\d{2}:\d{2}\sUTC"
        )

        for message in filtered_messages:
            dates = date_pattern.findall(message.text)
            if dates:
                for date in dates:
                    date_str = ' '.join(filter(None, date)).strip()
                    if date_str:
                        result = {'type': 'Guild Update Submission Cutoff', 'date': date_str}
                        print(result)
            else:
                print("No matching dates found in the message.")

asyncio.run(main())
