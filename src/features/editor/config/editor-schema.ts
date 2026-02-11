import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { Callout } from "../blocks/CalloutBlock";
import { TabGroup } from "../blocks/TabGroupBlock";
import { Steps } from "../blocks/StepsBlock";
import { Card } from "../blocks/CardBlock";
import { CardGrid } from "../blocks/CardGridBlock";

export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    callout: Callout,
    tabGroup: TabGroup,
    steps: Steps,
    card: Card,
    cardGrid: CardGrid,
  },
  inlineContentSpecs: defaultInlineContentSpecs,
  styleSpecs: defaultStyleSpecs,
});

export type SpecraSchema = typeof schema;
