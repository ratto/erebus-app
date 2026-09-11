import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { EmptyState } from '@/components/EmptyState';
import { EntityTable } from '@/components/EntityTable';
import type { EntityRowVariant } from '@/components/EntityTable';
import { ErrorState } from '@/components/ErrorState';
import { FilterBar } from '@/components/FilterBar';
import { SearchField } from '@/components/SearchField';
import { Skeleton } from '@/components/Skeleton';
import { SourceLevelBadge } from '@/components/SourceLevelBadge';
import { useSkills } from '@/hooks/use-skills';
import type { Skill } from '@/models/skill';
import { ROUTES } from '@/routes';

const Header = styled.header`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--sp-5);
  margin-bottom: var(--sp-4);
`;

const Title = styled.h1`
  color: var(--ink);
  font-family: var(--font-display);
  font-size: var(--fs-h2);
  font-weight: 500;
`;

const Count = styled.span`
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-data);
`;

const GroupTag = styled.span`
  margin-left: var(--sp-2);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Muted = styled.span`
  color: var(--ink-muted);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
`;

const Mono = styled.span`
  font-family: var(--font-mono);
  font-size: var(--fs-data);
`;

const COLUMNS = [
  { key: 'name', header: 'Skill' },
  { key: 'group', header: 'Group' },
  { key: 'baseAttribute', header: 'Base attribute', numeric: true },
  { key: 'description', header: 'Description' },
  { key: 'source', header: 'Source' },
] as const;

/**
 * The skills catalogue: search by name, filter by base attribute or source
 * level, and walk the group → subgroup hierarchy.
 *
 * A group that governs subgroups is marked "GROUP · NOT PLAYABLE" and carries the
 * accent rule, so it can never be mistaken for a playable leaf (AC 7); its
 * subgroups render indented beneath it. A skill with no group or no attribute —
 * `Explosivos` — renders that as content, because it is a canonical state and not
 * missing data (LLD §6.3).
 *
 * The detail route is nested here: it renders into `<Outlet/>` as a dialog over
 * this page, which keeps its state and its filter (LLD §5.3).
 */
export default function SkillsPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const {
    groups,
    total,
    matchCount,
    isEmpty,
    isFiltered,
    status,
    error,
    filter,
    baseAttributeOptions,
    setName,
    setSourceLevel,
    setBaseAttribute,
    clearFilters,
    reload,
  } = useSkills();

  // Presentation only: the hierarchy and its order were derived by the ViewModel;
  // this flattens each group and its subgroups into consecutive table rows.
  const rows = groups.flatMap((node) => [node.skill, ...node.subgroups]);

  const rowVariant = (skill: Skill): EntityRowVariant => {
    if (skill.hasSubgroups) return 'group';
    return skill.parentSkillId === null ? 'default' : 'child';
  };

  const renderCell = (skill: Skill, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <>
            {skill.name}
            {skill.hasSubgroups && <GroupTag>Group · not playable</GroupTag>}
          </>
        );
      case 'group':
        return skill.parentSkillName ?? <Muted>No group</Muted>;
      case 'baseAttribute':
        return skill.effectiveBaseAttribute === null ? (
          <Muted>No base attribute</Muted>
        ) : (
          <Mono>{skill.effectiveBaseAttribute}</Mono>
        );
      case 'description':
        return skill.description ?? <Muted>No description</Muted>;
      default:
        return <SourceLevelBadge level={skill.sourceLevel} compact />;
    }
  };

  return (
    <section aria-labelledby="skills-title">
      <Header>
        <Title id="skills-title">Skills</Title>
        <Count>
          {matchCount} of {total}
        </Count>
      </Header>

      <SearchField label="Search by name" value={filter.name} onChange={setName} />
      <FilterBar
        sourceLevel={filter.sourceLevel}
        onSourceLevelChange={setSourceLevel}
        facet={{
          label: 'Base attribute',
          value: filter.baseAttribute,
          options: baseAttributeOptions,
          onChange: setBaseAttribute,
        }}
        isFiltered={isFiltered}
        onClear={clearFilters}
      />

      {status === 'loading' && <Skeleton rows={8} />}

      {status === 'error' && error !== null && <ErrorState kind={error.kind} onRetry={reload} />}

      {status === 'ready' && isEmpty && (
        <EmptyState
          title={isFiltered ? 'No skill matches this search' : 'No skills available'}
          description={
            isFiltered
              ? 'Try a shorter name, or clear the filters to see the whole catalogue.'
              : 'The catalogue answered, but it holds no skill yet.'
          }
          {...(isFiltered ? { action: { label: 'Clear filters', onClick: clearFilters } } : {})}
        />
      )}

      {status === 'ready' && !isEmpty && (
        <EntityTable
          caption="Skills catalogue, grouped by skill group"
          columns={COLUMNS}
          rows={rows}
          rowKey={(skill) => skill.id}
          rowVariant={rowVariant}
          rowActionLabel={(skill) => `Open ${skill.name}`}
          renderCell={renderCell}
          onRowClick={(skill) => navigate({ pathname: ROUTES.skill(skill.id), search })}
        />
      )}

      <Outlet />
    </section>
  );
}
