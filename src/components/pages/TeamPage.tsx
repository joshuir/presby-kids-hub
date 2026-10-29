"use client";

import { Container } from "@/components/site/Container";
import { PageHero } from "@/components/site/PageHero";
import { TeamRoster } from "@/components/blocks/TeamRoster";

export function TeamPage() {
  return (
    <div>
      <PageHero page="team" eyebrow="Our teachers" title="Meet the team behind the *classes*" />
      <Container className="mt-12">
        <TeamRoster heading={false} />
      </Container>
    </div>
  );
}
