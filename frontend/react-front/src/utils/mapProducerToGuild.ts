import type { GuildResult, ProducersResponse } from '../services/types'

const mapProducerToGuild = (
  producers: ProducersResponse,
  guild: GuildResult
) => {
  const selectedProducers = producers.filter(
    (producer) => producer.owner_name === guild.owner_name
  )

  const top21 = selectedProducers[0]?.top21
  const country_code = selectedProducers[0]?.country_code
  const logo_svg = selectedProducers[0]?.logo_svg
  return { ...guild, ...{ country_code, logo_svg, top21 } }
}

export default mapProducerToGuild
