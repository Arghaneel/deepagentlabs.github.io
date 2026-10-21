"""Build repository-owned docs at the main website's MCP and Tower aliases."""

import argparse
import shutil
from pathlib import Path

from mkdocs.commands.build import build
from mkdocs.config import load_config


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sources', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    sources = args.sources.resolve()
    output = args.output.resolve()

    mcp = sources / 'mcp-server'
    build(load_config(
        config_file=str(mcp / 'mkdocs.yml'),
        site_dir=str(output / 'mcp/docs'),
        site_url='https://deepagentlabs.io/mcp/docs/',
    ))

    tower = sources / 'agenticops-control-tower'
    # Include root guides alongside docs so relative README/ROADMAP links work.
    staging = output.parent / 'tower-docs-source'
    if staging.exists():
        shutil.rmtree(staging)
    shutil.copytree(tower / 'docs', staging / 'docs')
    for source in tower.glob('*.md'):
        (staging / source.name).write_text(source.read_text().replace(
            '](.github/workflows/)',
            '](https://github.com/DeepAgentLabs/agenticops-control-tower/tree/main/.github/workflows/)',
        ))
    shutil.copytree(tower / 'examples', staging / 'examples')
    (staging / 'README.md').write_text(
        (tower / 'README.md').read_text()
        + '\n\n## Documentation guides\n\n'
        + '\n'.join(
            f'- [{path.stem.replace("-", " ").title()}](docs/{path.name})'
            for path in sorted((staging / 'docs').glob('*.md'))
        ) + '\n'
    )
    config_file = staging.parent / 'tower-mkdocs.yml'
    config_file.write_text(
        'site_name: AgenticOps Control Tower\n'
        'site_url: https://deepagentlabs.io/control-tower/docs/\n'
        'repo_url: https://github.com/DeepAgentLabs/agenticops-control-tower\n'
        f'docs_dir: {staging}\n'
        'theme:\n  name: material\n'
        'markdown_extensions:\n  - tables\n  - admonition\n  - pymdownx.superfences\n'
    )
    build(load_config(
        config_file=str(config_file),
        site_dir=str(output / 'control-tower/docs'),
    ))
    for alias in ('mcp', 'control-tower'):
        assert (output / alias / 'docs/index.html').is_file(), alias


if __name__ == '__main__':
    main()
