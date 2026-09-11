import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { DetailDialog } from '@/components/DetailDialog';
import { ErrorState } from '@/components/ErrorState';
import { ProvenanceBlock } from '@/components/ProvenanceBlock';
import { Skeleton } from '@/components/Skeleton';
import { useSkill } from '@/hooks/use-skill';
import { ROUTES } from '@/routes';

const Fields = styled.dl`
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--sp-2) var(--sp-4);
  align-items: baseline;
`;

const FieldLabel = styled.dt`
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const FieldValue = styled.dd`
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-field);
`;

const Muted = styled.span`
  color: var(--ink-muted);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
`;

const Mono = styled.span`
  font-family: var(--font-mono);
`;

const Description = styled.p`
  margin-top: var(--sp-5);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-body);
`;

const Notice = styled.p`
  margin-top: var(--sp-4);
  padding-left: var(--sp-3);
  border-left: var(--accent-rule) solid var(--accent-2);
  color: var(--ink-muted);
  font-family: var(--font-body);
  font-size: var(--fs-sm);
`;

const Subgroups = styled.section`
  margin-top: var(--sp-5);
`;

const SubgroupsTitle = styled.h3`
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: 0.16em;
  text-transform: uppercase;
`;

const CategoryTitle = styled.h4`
  margin-top: var(--sp-3);
  color: var(--accent-2-on-light);
  font-family: var(--font-mono);
  font-size: var(--fs-badge);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const SubgroupList = styled.ul`
  margin-top: var(--sp-2);
  padding-left: var(--sp-5);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-cell);
`;

/**
 * English UI copy for the N3 classification of `Condução`, whose values are
 * Portuguese domain data (LLD §15 item 2). An unseen category renders its own
 * value, because a new one is data rather than a defect.
 */
const CATEGORY_LABEL: Record<string, string> = {
  condução: 'Ordinary driving',
  pilotagem: 'Specialised piloting',
};

/**
 * One skill: its place in the hierarchy, its governing attribute, its
 * description, and the subgroups it governs.
 *
 * Rendered inside `DetailDialog` through the listing page's `<Outlet/>`, so the
 * URL is deep-linkable and the back button closes it. Closing keeps the query
 * string, so the filter the user came in with survives the round trip (§5.3).
 *
 * The canonical "empty" states are content, never errors: a root leaf shows
 * "No group", a skill with no governing attribute shows "No base attribute", and
 * a group flagged with subgroups it does not catalogue (`Artífice`) shows its
 * divergence note as a footnote.
 */
export default function SkillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { item, subgroupsByCategory, status, error, reload } = useSkill(Number(id));

  const close = () => navigate({ pathname: ROUTES.skills, search });

  return (
    <DetailDialog title={item?.name ?? 'Skill'} onClose={close}>
      {status === 'loading' && <Skeleton rows={5} />}

      {status === 'error' && error !== null && <ErrorState kind={error.kind} onRetry={reload} />}

      {status === 'ready' && item !== null && (
        <>
          <Fields>
            <FieldLabel>Group</FieldLabel>
            <FieldValue>{item.parentSkillName ?? <Muted>No group</Muted>}</FieldValue>

            <FieldLabel>Base attribute</FieldLabel>
            <FieldValue>
              {item.effectiveBaseAttribute === null ? (
                <Muted>No base attribute</Muted>
              ) : (
                <>
                  <Mono>{item.effectiveBaseAttribute}</Mono>
                  {item.baseAttribute === null && <Muted> · inherited from the group</Muted>}
                </>
              )}
            </FieldValue>

            {item.category !== null && (
              <>
                <FieldLabel>Category</FieldLabel>
                <FieldValue>{CATEGORY_LABEL[item.category] ?? item.category}</FieldValue>
              </>
            )}
          </Fields>

          <Description>{item.description ?? <Muted>No description recorded.</Muted>}</Description>

          {item.hasSubgroups && (
            <Notice>
              This is a skill group: it is bought through one of its subgroups, never on its own.
            </Notice>
          )}

          {item.notes !== null && <Notice>{item.notes}</Notice>}

          {subgroupsByCategory.length > 0 && (
            <Subgroups aria-label="Subgroups">
              <SubgroupsTitle>Subgroups</SubgroupsTitle>
              {subgroupsByCategory.map((node) => (
                <div key={node.category ?? 'uncategorised'}>
                  {node.category !== null && (
                    <CategoryTitle>{CATEGORY_LABEL[node.category] ?? node.category}</CategoryTitle>
                  )}
                  <SubgroupList>
                    {node.subgroups.map((subgroup) => (
                      <li key={subgroup.id}>{subgroup.name}</li>
                    ))}
                  </SubgroupList>
                </div>
              ))}
            </Subgroups>
          )}

          <ProvenanceBlock provenance={item} />
        </>
      )}
    </DetailDialog>
  );
}
